"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, FlipVertical, Mic, MicOff, RotateCcw, Video, VideoOff, Volume2 } from "lucide-react";
import { StatusBadge } from "@/shared/components/custom/status-badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { API_BASE } from "@/shared/api/client";

const REGEX_PATTERN = /\/$/;
const HTTP_TO_WS_PATTERN = /^http/;
const SAMPLE_RATE = 16000;

interface FacilityCameraViewProps {
	clinicName: string;
}

export function FacilityCameraView({ clinicName }: FacilityCameraViewProps) {
	// ── Camera state ────────────────────────────────────────────────────────
	const [camSrc, setCamSrc] = useState("");
	const [camStatus, setCamStatus] = useState<"disconnected" | "connected" | "streaming" | "error">("disconnected");
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [flip, setFlip] = useState(false);

	// ── Audio state ─────────────────────────────────────────────────────────
	const [micMuted, setMicMuted] = useState(true); // doctor starts muted
	const [patientAudio, setPatientAudio] = useState(false); // true when receiving patient audio

	const audioWsRef = useRef<WebSocket | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);
	const nextPlayRef = useRef<number>(0);
	const micStreamRef = useRef<MediaStream | null>(null);
	const micProcessorRef = useRef<ScriptProcessorNode | null>(null);

	// Clean up on unmount
	useEffect(() => {
		return () => {
			stopDoctorMic(false);
			audioWsRef.current?.close();
			audioCtxRef.current?.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Audio helpers ────────────────────────────────────────────────────────

	function getAudioCtx(): AudioContext {
		if (!audioCtxRef.current) {
			audioCtxRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
		}
		if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
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
		sock.onclose = () => {
			audioWsRef.current = null;
			nextPlayRef.current = 0;
			setPatientAudio(false);
		};
		sock.onerror = () => { setPatientAudio(false); };
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

	// ── Doctor mic ────────────────────────────────────────────────────────────

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

	// ── Camera ────────────────────────────────────────────────────────────────

	const connectStream = useCallback(() => {
		if (ws) return;
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		const httpUrl = `${base}/ws/stream?clinic=${encodeURIComponent(clinicName)}&patient=`;
		const wsUrl = httpUrl.startsWith("ws") ? httpUrl : httpUrl.replace(HTTP_TO_WS_PATTERN, "ws");
		const sock = new WebSocket(wsUrl);
		sock.binaryType = "arraybuffer";
		sock.onopen = () => {
			setCamStatus("connected");
			setWs(sock);
			connectAudio(); // auto-join audio channel when stream starts
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
		disconnectAudio(); // also leave audio channel
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

	const isConnected = camStatus === "connected" || camStatus === "streaming";

	return (
		<div className="space-y-6">
			{/* Main monitor */}
			<Card className="overflow-hidden border-none shadow-2xl bg-zinc-950">
				<CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-900/50">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-emerald-500/10">
							<Video className="size-5 text-emerald-500" />
						</div>
						<div>
							<p className="text-base font-bold text-white tracking-tight">Facility Live Stream</p>
							<p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{clinicName} • Secure Link</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						{/* Patient audio indicator */}
						{isConnected && patientAudio && (
							<div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
								<Volume2 className="size-3 text-emerald-400" />
								<span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Patient Mic</span>
							</div>
						)}
						<StatusBadge status={isConnected ? "online" : "offline"} />
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
							<div className="flex flex-col items-center gap-6 text-zinc-700">
								<div className="relative">
									<VideoOff className="size-16 animate-pulse" />
									<div className="absolute inset-0 blur-2xl bg-emerald-500/10 scale-150" />
								</div>
								<div className="text-center space-y-1">
									<p className="text-lg font-semibold text-zinc-400">Signal Lost</p>
									<p className="text-xs text-zinc-600 font-medium">Awaiting handshake from {clinicName} Desktop App</p>
								</div>
							</div>
						)}

						{isConnected && (
							<>
								<div className="absolute top-6 left-6 flex items-center gap-3 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
									<div className="flex items-center gap-2">
										<div className="size-2 rounded-full bg-red-500 animate-pulse" />
										<span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live REC</span>
									</div>
									<div className="w-px h-3 bg-white/20" />
									<span className="text-[10px] font-mono text-zinc-400 tracking-tighter">00:04:12:09</span>
								</div>

								{/* Mic indicator overlay */}
								{!micMuted && (
									<div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-red-500/30">
										<div className="size-2 rounded-full bg-red-500 animate-pulse" />
										<span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Doctor Mic Live</span>
									</div>
								)}
							</>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Control console */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Connection + mic controls */}
				<Card className="bg-muted/30 border-dashed">
					<CardHeader className="pb-3">
						<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Link Management</p>
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						<Button
							onClick={connectStream}
							disabled={isConnected}
							className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20"
						>
							<Video className="size-4 mr-2" />
							Initialize Stream
						</Button>
						<Button
							variant="outline"
							onClick={disconnectStream}
							disabled={!isConnected}
							className="w-full border-red-500/20 hover:bg-red-500/10 hover:text-red-500 transition-colors"
						>
							<VideoOff className="size-4 mr-2" />
							Terminate Link
						</Button>

						{/* Mic mute/unmute — only shown when connected */}
						<div className="pt-1 border-t border-border/50">
							<Button
								onClick={() => micMuted ? unmuteMic() : muteMic(true)}
								disabled={!isConnected}
								className={`w-full font-bold transition-colors ${
									micMuted
										? "bg-zinc-800 hover:bg-zinc-700 text-white"
										: "bg-red-600 hover:bg-red-500 text-white"
								}`}
							>
								{micMuted
									? <><Mic className="size-4 mr-2" />Unmute My Mic</>
									: <><MicOff className="size-4 mr-2" />Mute My Mic</>}
							</Button>
							<p className="mt-1 text-[9px] text-muted-foreground text-center">
								{micMuted ? "Patient cannot hear you" : "Patient can hear you"}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* D-Pad */}
				<Card className="md:col-span-1">
					<CardHeader className="pb-3 flex flex-row items-center justify-between">
						<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Precision PTZ</p>
						<Button
							variant="ghost"
							size="icon"
							className="size-6 text-muted-foreground hover:text-primary"
							onClick={() => sendCameraControl("reset")}
						>
							<RotateCcw className="size-3" />
						</Button>
					</CardHeader>
					<CardContent className="flex justify-center">
						<div className="grid grid-cols-3 gap-2 bg-zinc-900 p-3 rounded-2xl border border-white/5">
							<div />
							<Button variant="secondary" size="icon" className="size-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 shadow-xl" onClick={() => sendCameraControl("move-up")}>
								<ChevronUp className="size-6" />
							</Button>
							<div />
							<Button variant="secondary" size="icon" className="size-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 shadow-xl" onClick={() => sendCameraControl("move-left")}>
								<ChevronLeft className="size-6" />
							</Button>
							<div className="size-12 flex items-center justify-center">
								<div className="size-1.5 rounded-full bg-primary animate-pulse" />
							</div>
							<Button variant="secondary" size="icon" className="size-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 shadow-xl" onClick={() => sendCameraControl("move-right")}>
								<ChevronRight className="size-6" />
							</Button>
							<div />
							<Button variant="secondary" size="icon" className="size-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 shadow-xl" onClick={() => sendCameraControl("move-down")}>
								<ChevronDown className="size-6" />
							</Button>
							<div />
						</div>
					</CardContent>
				</Card>

				{/* Signal / Utility */}
				<Card className="bg-muted/30 border-dashed">
					<CardHeader className="pb-3">
						<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Signal Processing</p>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button
							variant="secondary"
							onClick={() => setFlip(f => !f)}
							className="w-full bg-zinc-800/50 hover:bg-zinc-800 text-xs font-bold"
						>
							<FlipVertical className="size-4 mr-2" />
							Mirror Vertical Axis
						</Button>
						<div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 space-y-2">
							<div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase">
								<span>Bitrate</span>
								<span className="text-emerald-500">4.2 Mbps</span>
							</div>
							<div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
								<div className="w-[70%] h-full bg-emerald-500" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
