"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	FlipVertical,
	Mic,
	MicOff,
	Phone,
	PhoneOff,
	RotateCcw,
	Volume2,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/custom/status-badge";
import { ClinicChat } from "@/shared/components/custom/clinic-chat";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { API_BASE } from "@/shared/api/client";

const REGEX_PATTERN = /\/$/;
const HTTP_TO_WS_PATTERN = /^http/;
const SAMPLE_RATE = 16000;

interface FacilityCameraViewProps {
	clinicName: string;
	senderName?: string;
}

function StreamIconButton({
	label,
	onClick,
	disabled,
	active,
	children,
}: {
	label: string;
	onClick: () => void;
	disabled?: boolean;
	active?: boolean;
	children: React.ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger
				render={(
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className={`size-8 text-zinc-300 hover:text-white hover:bg-white/10 ${active ? "bg-emerald-500/20 text-emerald-400" : ""}`}
						onClick={onClick}
						disabled={disabled}
						aria-label={label}
					>
						{children}
					</Button>
				)}
			/>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

export function FacilityCameraView({ clinicName, senderName }: FacilityCameraViewProps) {
	const [camSrc, setCamSrc] = useState("");
	const [camStatus, setCamStatus] = useState<"disconnected" | "connected" | "streaming" | "error">("disconnected");
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [flip, setFlip] = useState(false);
	const [micMuted, setMicMuted] = useState(true);
	const [patientAudio, setPatientAudio] = useState(false);

	const audioWsRef = useRef<WebSocket | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);
	const nextPlayRef = useRef<number>(0);
	const micStreamRef = useRef<MediaStream | null>(null);
	const micProcessorRef = useRef<ScriptProcessorNode | null>(null);

	useEffect(() => {
		return () => {
			stopDoctorMic(false);
			audioWsRef.current?.close();
			audioCtxRef.current?.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function getAudioCtx(): AudioContext {
		if (!audioCtxRef.current) {
			audioCtxRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
		}
		if (audioCtxRef.current.state === "suspended") {
			void audioCtxRef.current.resume();
		}
		return audioCtxRef.current;
	}

	function playPCMChunk(buffer: ArrayBuffer) {
		const ctx = getAudioCtx();
		const samples = new Int16Array(buffer);
		const ab = ctx.createBuffer(1, samples.length, SAMPLE_RATE);
		const ch = ab.getChannelData(0);
		for (let i = 0; i < samples.length; i++) ch[i] = samples[i] / 32768;
		const src = ctx.createBufferSource();
		src.buffer = ab;
		src.connect(ctx.destination);
		const now = ctx.currentTime;
		const start = Math.max(now, nextPlayRef.current);
		src.start(start);
		nextPlayRef.current = start + ab.duration;
	}

	function connectAudio() {
		if (audioWsRef.current) return;
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		const httpUrl = `${base}/ws/audio-stream?clinic=${encodeURIComponent(clinicName)}`;
		const wsUrl = httpUrl.startsWith("ws") ? httpUrl : httpUrl.replace(HTTP_TO_WS_PATTERN, "ws");
		const sock = new WebSocket(wsUrl);
		sock.binaryType = "arraybuffer";
		sock.onopen = () => {
			void getAudioCtx().resume();
		};
		sock.onclose = () => {
			audioWsRef.current = null;
			nextPlayRef.current = 0;
			setPatientAudio(false);
		};
		sock.onerror = () => setPatientAudio(false);
		sock.onmessage = (ev) => {
			if (ev.data instanceof ArrayBuffer && ev.data.byteLength > 0) {
				playPCMChunk(ev.data);
				setPatientAudio(true);
			}
		};
		audioWsRef.current = sock;
	}

	function disconnectAudio() {
		stopDoctorMic(true);
		audioWsRef.current?.close();
		audioWsRef.current = null;
		nextPlayRef.current = 0;
		setPatientAudio(false);
		setMicMuted(true);
	}

	async function sendMicControl(command: "mic-on" | "mic-off") {
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		await fetch(`${base}/api/mic/control`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ clinic_name: clinicName, command }),
		}).catch(() => {});
	}

	async function unmuteMic() {
		if (!micMuted) return;
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
			micStreamRef.current = stream;
			const ctx = getAudioCtx();
			const source = ctx.createMediaStreamSource(stream);
			const processor = ctx.createScriptProcessor(2048, 1, 1);
			processor.onaudioprocess = (e) => {
				const sock = audioWsRef.current;
				if (!sock || sock.readyState !== WebSocket.OPEN) return;
				const f32 = e.inputBuffer.getChannelData(0);
				const i16 = new Int16Array(f32.length);
				for (let i = 0; i < f32.length; i++) i16[i] = Math.max(-32768, Math.min(32767, f32[i] * 32768));
				sock.send(i16.buffer);
			};
			source.connect(processor);
			processor.connect(ctx.destination);
			micProcessorRef.current = processor;
			setMicMuted(false);
			await sendMicControl("mic-on");
		} catch (err) {
			console.error("Mic error:", err);
		}
	}

	function muteMic(sendOff = true) {
		micProcessorRef.current?.disconnect();
		micProcessorRef.current = null;
		micStreamRef.current?.getTracks().forEach((t) => t.stop());
		micStreamRef.current = null;
		if (sendOff && !micMuted) sendMicControl("mic-off").catch(() => {});
		setMicMuted(true);
	}

	function stopDoctorMic(sendOff: boolean) {
		muteMic(sendOff);
	}

	const connectStream = useCallback(() => {
		if (ws) return;
		void getAudioCtx().resume();
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		const httpUrl = `${base}/ws/stream?clinic=${encodeURIComponent(clinicName)}&patient=`;
		const wsUrl = httpUrl.startsWith("ws") ? httpUrl : httpUrl.replace(HTTP_TO_WS_PATTERN, "ws");
		const sock = new WebSocket(wsUrl);
		sock.binaryType = "arraybuffer";
		sock.onopen = () => {
			setCamStatus("connected");
			setWs(sock);
			connectAudio();
		};
		sock.onclose = () => {
			setCamStatus("disconnected");
			setWs(null);
			setCamSrc("");
		};
		sock.onerror = () => setCamStatus("error");
		sock.onmessage = (ev) => {
			if (ev.data instanceof ArrayBuffer) {
				setCamSrc(URL.createObjectURL(new Blob([ev.data], { type: "image/jpeg" })));
				setCamStatus("streaming");
			}
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ws, clinicName]);

	const disconnectStream = useCallback(() => {
		ws?.close();
		setWs(null);
		disconnectAudio();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ws]);

	async function sendCameraControl(command: string) {
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		await fetch(`${base}/api/camera/control`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ clinic_name: clinicName, command }),
		}).catch(() => {});
	}

	const isInCall = camStatus === "connected" || camStatus === "streaming";

	return (
		<TooltipProvider>
			<Tabs defaultValue="stream" className="w-full flex flex-col items-center gap-4">
				<TabsList className="bg-muted/50 border h-9 w-fit shrink-0">
					<TabsTrigger value="stream" className="text-xs px-4">Live Stream</TabsTrigger>
					<TabsTrigger value="controls" className="text-xs px-4">Camera Control</TabsTrigger>
				</TabsList>

				<TabsContent value="stream" className="mt-0 w-full max-w-5xl space-y-0">
					<Card className="overflow-hidden border-none shadow-2xl bg-zinc-950 rounded-b-none">
						<CardHeader className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 border-b border-white/5 bg-zinc-900/50">
							<div className="min-w-0 justify-self-start">
								<p className="text-sm font-bold text-white tracking-tight truncate">Facility Live Stream</p>
								<p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest truncate">{clinicName}</p>
							</div>

							<div className="flex items-center justify-center gap-1 rounded-full bg-black/30 px-1.5 py-1 border border-white/10">
								<StreamIconButton
									label="Start call"
									onClick={connectStream}
									disabled={isInCall}
									active={isInCall}
								>
									<Phone className="size-4" />
								</StreamIconButton>
								<StreamIconButton
									label="End call"
									onClick={disconnectStream}
									disabled={!isInCall}
								>
									<PhoneOff className="size-4" />
								</StreamIconButton>
								<StreamIconButton
									label={micMuted ? "Unmute mic" : "Mute mic"}
									onClick={() => (micMuted ? unmuteMic() : muteMic(true))}
									disabled={!isInCall}
									active={!micMuted}
								>
									{micMuted ? <Mic className="size-4" /> : <MicOff className="size-4" />}
								</StreamIconButton>
							</div>

							<div className="flex items-center justify-end gap-2 justify-self-end">
								{isInCall && patientAudio && (
									<div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
										<Volume2 className="size-3 text-emerald-400" />
										<span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Patient</span>
									</div>
								)}
								<StatusBadge status={isInCall ? "online" : "offline"} size="sm" />
							</div>
						</CardHeader>

						<CardContent className="p-0">
							<div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
								{camSrc ? (
									<img
										src={camSrc}
										alt="Facility Live Feed"
										className={`w-full h-full object-contain transition-transform duration-500 ${flip ? "scale-y-[-1]" : ""}`}
									/>
								) : (
									<div className="flex flex-col items-center gap-4 text-zinc-700 px-4 text-center">
										<PhoneOff className="size-14 animate-pulse" />
										<div className="space-y-1">
											<p className="text-base font-semibold text-zinc-400">No active call</p>
											<p className="text-xs text-zinc-600">Press the call button when the clinic is live</p>
										</div>
									</div>
								)}
								{isInCall && !micMuted && (
									<div className="absolute top-4 right-4 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xl border border-red-500/30">
										<div className="size-2 rounded-full bg-red-500 animate-pulse" />
										<span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Mic Live</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					<ClinicChat
						clinicName={clinicName}
						senderName={senderName || "Doctor"}
						enabled={isInCall}
						compact
						embedded
					/>
				</TabsContent>

				<TabsContent value="controls" className="mt-0 w-full max-w-5xl">
					<Card>
						<CardHeader className="pb-3">
							<p className="text-sm font-semibold">Camera Control</p>
							<p className="text-xs text-muted-foreground">Pan, tilt, and reset the clinic camera</p>
						</CardHeader>
						<CardContent className="flex flex-col items-center gap-4 pb-8">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="gap-2"
								onClick={() => sendCameraControl("reset")}
							>
								<RotateCcw className="size-4" />
								Reset position
							</Button>
							<div className="grid grid-cols-3 gap-2 bg-zinc-900 p-3 rounded-2xl border border-white/5">
								<div />
								<Button variant="secondary" size="icon" className="size-12 rounded-xl" onClick={() => sendCameraControl("move-up")}>
									<ChevronUp className="size-6" />
								</Button>
								<div />
								<Button variant="secondary" size="icon" className="size-12 rounded-xl" onClick={() => sendCameraControl("move-left")}>
									<ChevronLeft className="size-6" />
								</Button>
								<div className="size-12 flex items-center justify-center">
									<div className="size-1.5 rounded-full bg-primary animate-pulse" />
								</div>
								<Button variant="secondary" size="icon" className="size-12 rounded-xl" onClick={() => sendCameraControl("move-right")}>
									<ChevronRight className="size-6" />
								</Button>
								<div />
								<Button variant="secondary" size="icon" className="size-12 rounded-xl" onClick={() => sendCameraControl("move-down")}>
									<ChevronDown className="size-6" />
								</Button>
								<div />
							</div>
							<Button type="button" variant="secondary" onClick={() => setFlip((f) => !f)} className="gap-2">
								<FlipVertical className="size-4" />
								Flip view vertically
							</Button>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</TooltipProvider>
	);
}
