"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2 } from "lucide-react";
import { StatusBadge } from "@/shared/components/custom/status-badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { API_BASE } from "@/shared/api/client";

const REGEX_PATTERN = /\/$/;
const HTTP_TO_WS_PATTERN = /^http/;
const SAMPLE_RATE = 16000;

interface FacilityAudioViewProps {
	clinicName: string;
}

export function FacilityAudioView({ clinicName }: FacilityAudioViewProps) {
	const [audioStatus, setAudioStatus] = useState<"disconnected" | "connected" | "receiving" | "error">("disconnected");
	const [micOn, setMicOn] = useState(false);

	const audioWsRef = useRef<WebSocket | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);
	const nextPlayTimeRef = useRef<number>(0);
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

	// ── AudioContext ───────────────────────────────────────────────────────

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
		const start = Math.max(now, nextPlayTimeRef.current);
		src.start(start);
		nextPlayTimeRef.current = start + ab.duration;
	}

	// ── WebSocket ──────────────────────────────────────────────────────────

	const connectAudio = useCallback(() => {
		if (audioWsRef.current) return;
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		const httpUrl = `${base}/ws/audio-stream?clinic=${encodeURIComponent(clinicName)}`;
		const wsUrl = httpUrl.startsWith("ws") ? httpUrl : httpUrl.replace(HTTP_TO_WS_PATTERN, "ws");
		const sock = new WebSocket(wsUrl);
		sock.binaryType = "arraybuffer";
		sock.onopen = () => {
			setAudioStatus("connected");
			audioWsRef.current = sock;
		};
		sock.onclose = () => {
			setAudioStatus("disconnected");
			audioWsRef.current = null;
			nextPlayTimeRef.current = 0;
		};
		sock.onerror = () => setAudioStatus("error");
		sock.onmessage = (ev) => {
			if (ev.data instanceof ArrayBuffer && ev.data.byteLength > 0) {
				playPCMChunk(ev.data);
				setAudioStatus("receiving");
			}
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clinicName]);

	const disconnectAudio = useCallback(() => {
		stopDoctorMic(true);
		audioWsRef.current?.close();
		audioWsRef.current = null;
		nextPlayTimeRef.current = 0;
		setAudioStatus("disconnected");
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Mic ────────────────────────────────────────────────────────────────

	async function sendMicControl(command: "mic-on" | "mic-off") {
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		await fetch(`${base}/api/mic/control`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ clinic_name: clinicName, command }),
		}).catch(() => {});
	}

	async function startDoctorMic() {
		if (micOn) return;
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
				for (let i = 0; i < f32.length; i++) {
					i16[i] = Math.max(-32768, Math.min(32767, f32[i] * 32768));
				}
				sock.send(i16.buffer);
			};
			source.connect(processor);
			processor.connect(ctx.destination);
			micProcessorRef.current = processor;
			setMicOn(true);
			await sendMicControl("mic-on");
		} catch (err) {
			console.error("Mic access error:", err);
		}
	}

	function stopDoctorMic(sendOff = true) {
		micProcessorRef.current?.disconnect();
		micProcessorRef.current = null;
		micStreamRef.current?.getTracks().forEach((t) => t.stop());
		micStreamRef.current = null;
		if (sendOff && micOn) sendMicControl("mic-off").catch(() => {});
		setMicOn(false);
	}

	const isConnected = audioStatus === "connected" || audioStatus === "receiving";

	return (
		<div className="space-y-6">
			{/* Main audio panel */}
			<Card className="overflow-hidden border-none shadow-2xl bg-zinc-950">
				<CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-900/50">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-emerald-500/10">
							<Volume2 className="size-5 text-emerald-500" />
						</div>
						<div>
							<p className="text-base font-bold text-white tracking-tight">Audio Channel</p>
							<p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{clinicName} • Two-way Comms</p>
						</div>
					</div>
					<StatusBadge status={isConnected ? "online" : audioStatus === "error" ? "offline" : "offline"} />
				</CardHeader>

				<CardContent className="p-0">
					<div className="relative w-full bg-black min-h-[180px] flex flex-col items-center justify-center gap-4">
						{audioStatus === "receiving" ? (
							<>
								<div className="flex items-end gap-1.5">
									{Array.from({ length: 20 }).map((_, i) => (
										<div
											key={i}
											className="w-1.5 rounded-full bg-emerald-500 animate-pulse"
											style={{ height: `${10 + Math.random() * 40}px`, animationDelay: `${i * 50}ms` }}
										/>
									))}
								</div>
								<p className="text-sm font-semibold text-emerald-400">Receiving patient audio</p>
							</>
						) : isConnected ? (
							<>
								<Volume2 className="size-10 text-zinc-600 animate-pulse" />
								<p className="text-sm text-zinc-500">Connected — awaiting patient mic</p>
							</>
						) : (
							<>
								<MicOff className="size-10 text-zinc-700" />
								<p className="text-sm text-zinc-500">Audio channel offline</p>
								<p className="text-xs text-zinc-600">Initialize to begin two-way communication</p>
							</>
						)}

						{/* HUD: mic active indicator */}
						{micOn && (
							<div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-red-500/30">
								<div className="size-2 rounded-full bg-red-500 animate-pulse" />
								<span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Doctor Mic Active</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Controls row */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Connection */}
				<Card className="bg-muted/30 border-dashed">
					<CardHeader className="pb-3">
						<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Channel Management</p>
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						<Button
							onClick={connectAudio}
							disabled={isConnected}
							className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20"
						>
							<PhoneCall className="size-4 mr-2" />
							Initialize Audio
						</Button>
						<Button
							variant="outline"
							onClick={disconnectAudio}
							disabled={!isConnected}
							className="w-full border-red-500/20 hover:bg-red-500/10 hover:text-red-500 transition-colors"
						>
							<PhoneOff className="size-4 mr-2" />
							Terminate Channel
						</Button>
					</CardContent>
				</Card>

				{/* Mic toggle */}
				<Card className="bg-muted/30 border-dashed">
					<CardHeader className="pb-3">
						<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Doctor Microphone</p>
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						<Button
							onClick={() => micOn ? stopDoctorMic(true) : startDoctorMic()}
							disabled={!isConnected}
							className={`w-full font-bold transition-colors ${micOn ? "bg-red-600 hover:bg-red-500 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-white"}`}
						>
							{micOn
								? <><MicOff className="size-4 mr-2" />Mute My Mic</>
								: <><Mic className="size-4 mr-2" />Speak to Patient</>}
						</Button>
						<p className="text-[10px] text-muted-foreground leading-snug text-center">
							Activates your browser mic and signals the desktop to unmute the patient&apos;s side
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
