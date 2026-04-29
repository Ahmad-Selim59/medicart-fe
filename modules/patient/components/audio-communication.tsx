"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2 } from "lucide-react";
import { StatusBadge } from "@/shared/components/custom/status-badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Patient } from "@/shared/types/api";
import { API_BASE } from "@/shared/api/client";

const REGEX_PATTERN = /\/$/;
const HTTP_TO_WS_PATTERN = /^http/;
const SAMPLE_RATE = 16000;
const CHUNK_BYTES = 3200; // 100 ms of s16le mono at 16 kHz

export function AudioCommunication({ patient }: { patient: Patient }) {
	const [audioStatus, setAudioStatus] = useState<"disconnected" | "connected" | "receiving" | "error">("disconnected");
	const [micOn, setMicOn] = useState(false);

	const audioWsRef = useRef<WebSocket | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);
	const nextPlayTimeRef = useRef<number>(0);
	const micStreamRef = useRef<MediaStream | null>(null);
	const micProcessorRef = useRef<ScriptProcessorNode | null>(null);

	// Disconnect audio and stop mic on unmount
	useEffect(() => {
		return () => {
			stopDoctorMic(false);
			closeAudioWs();
			audioCtxRef.current?.close();
			audioCtxRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Audio context ──────────────────────────────────────────────────────

	function getAudioCtx(): AudioContext {
		if (!audioCtxRef.current) {
			audioCtxRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
		}
		if (audioCtxRef.current.state === "suspended") {
			audioCtxRef.current.resume();
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
		const start = Math.max(now, nextPlayTimeRef.current);
		src.start(start);
		nextPlayTimeRef.current = start + ab.duration;
	}

	// ── WebSocket ──────────────────────────────────────────────────────────

	function closeAudioWs() {
		audioWsRef.current?.close();
		audioWsRef.current = null;
	}

	const connectAudio = useCallback(() => {
		if (audioWsRef.current) return;
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		const httpUrl = `${base}/ws/audio-stream?clinic=${encodeURIComponent(patient?.clinicId || "")}`;
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
	}, [patient]);

	const disconnectAudio = useCallback(() => {
		stopDoctorMic(true);
		closeAudioWs();
		nextPlayTimeRef.current = 0;
		setAudioStatus("disconnected");
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Doctor mic capture ─────────────────────────────────────────────────

	async function sendMicControl(command: "mic-on" | "mic-off") {
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		await fetch(`${base}/api/mic/control`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ clinic_name: patient?.clinicId || "", command }),
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

	async function toggleMic() {
		if (micOn) stopDoctorMic(true);
		else await startDoctorMic();
	}

	const isConnected = audioStatus === "connected" || audioStatus === "receiving";

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
			{/* Audio visualiser / status panel */}
			<Card className="lg:col-span-3">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Audio Communication</CardTitle>
						<StatusBadge status={isConnected ? "online" : audioStatus === "error" ? "offline" : "offline"} />
					</div>
				</CardHeader>
				<CardContent>
					<div className="border rounded-lg bg-muted min-h-[120px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
						{audioStatus === "receiving" ? (
							<>
								<div className="flex items-center gap-1.5">
									{Array.from({ length: 12 }).map((_, i) => (
										<div
											key={i}
											className="w-1.5 rounded-full bg-emerald-500 animate-pulse"
											style={{ height: `${8 + Math.random() * 24}px`, animationDelay: `${i * 60}ms` }}
										/>
									))}
								</div>
								<p className="text-sm text-emerald-600 font-medium">Receiving patient audio</p>
							</>
						) : isConnected ? (
							<>
								<Volume2 className="size-8 opacity-40" />
								<p className="text-sm">Connected — waiting for patient mic</p>
							</>
						) : (
							<>
								<MicOff className="size-8 opacity-40" />
								<p className="text-sm">Audio not connected</p>
								<p className="text-xs">Click &quot;Connect Audio&quot; to begin</p>
							</>
						)}
					</div>

					{micOn && (
						<div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
							<div className="size-2 rounded-full bg-red-500 animate-pulse" />
							<span className="text-xs font-semibold text-red-600">Your microphone is active — patient can hear you</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Controls */}
			<Card>
				<CardHeader>
					<CardTitle>Audio Controls</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Button onClick={connectAudio} disabled={isConnected} className="w-full">
						<PhoneCall className="size-4 mr-2" />
						Connect Audio
					</Button>
					<Button variant="outline" onClick={disconnectAudio} disabled={!isConnected} className="w-full">
						<PhoneOff className="size-4 mr-2" />
						Disconnect
					</Button>

					<div className="pt-1">
						<Button
							onClick={toggleMic}
							disabled={!isConnected}
							className={`w-full font-semibold ${micOn ? "bg-red-600 hover:bg-red-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
						>
							{micOn
								? <><MicOff className="size-4 mr-2" />Mute My Mic</>
								: <><Mic className="size-4 mr-2" />Speak to Patient</>}
						</Button>
						<p className="mt-1.5 text-[10px] text-muted-foreground text-center leading-snug">
							Toggles your mic and signals the desktop to unmute the patient
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
