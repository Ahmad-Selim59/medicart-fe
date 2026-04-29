"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, FlipVertical, Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";
import { StatusBadge } from "@/shared/components/custom/status-badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Patient } from "@/shared/types/api";
import { API_BASE } from "@/shared/api/client";

const REGEX_PATTERN = /\/$/;
const HTTP_TO_WS_PATTERN = /^http/;
const SAMPLE_RATE = 16000;

export function CameraView({ patient }: { patient: Patient }) {
	// ── Camera state ────────────────────────────────────────────────────────
	const [camSrc, setCamSrc] = useState("");
	const [camStatus, setCamStatus] = useState<"disconnected" | "connected" | "streaming" | "error">("disconnected");
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [flip, setFlip] = useState(false);

	// ── Audio state ─────────────────────────────────────────────────────────
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
		const httpUrl = `${base}/ws/audio-stream?clinic=${encodeURIComponent(patient?.clinicId || "")}`;
		const wsUrl = httpUrl.startsWith("ws") ? httpUrl : httpUrl.replace(HTTP_TO_WS_PATTERN, "ws");
		const sock = new WebSocket(wsUrl);
		sock.binaryType = "arraybuffer";
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

	// ── Doctor mic ────────────────────────────────────────────────────────────

	async function sendMicControl(command: "mic-on" | "mic-off") {
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		await fetch(`${base}/api/mic/control`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ clinic_name: patient?.clinicId || "", command }),
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
		const httpUrl = `${base}/ws/stream?clinic=${encodeURIComponent(patient?.clinicId || "")}&patient=${encodeURIComponent(patient?.id || "")}`;
		const wsUrl = httpUrl.startsWith("ws") ? httpUrl : httpUrl.replace(HTTP_TO_WS_PATTERN, "ws");
		const sock = new WebSocket(wsUrl);
		sock.binaryType = "arraybuffer";
		sock.onopen = () => {
			setCamStatus("connected");
			setWs(sock);
			connectAudio(); // auto-join audio channel
		};
		sock.onclose = () => {
			setCamStatus("disconnected");
			setWs(null);
		};
		sock.onerror = () => setCamStatus("error");
		sock.onmessage = (ev) => {
			if (ev.data instanceof ArrayBuffer) {
				setCamSrc(URL.createObjectURL(new Blob([ev.data], { type: "image/jpeg" })));
				setCamStatus("streaming");
			}
		};
		setWs(sock);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ws, patient]);

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
			body: JSON.stringify({ command }),
		}).catch(() => {});
	}

	const isConnected = camStatus === "connected" || camStatus === "streaming";

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
			{/* Camera feed */}
			<Card className="lg:col-span-3">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Camera Feed</CardTitle>
						<div className="flex items-center gap-2">
							{isConnected && patientAudio && (
								<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
									<Volume2 className="size-3 text-emerald-500" />
									<span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Patient Mic</span>
								</div>
							)}
							<StatusBadge status={isConnected ? "online" : camStatus === "error" ? "offline" : "offline"} />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="border rounded-lg overflow-hidden bg-muted min-h-[300px] flex items-center justify-center">
						{camSrc
							? (
								<img
									src={camSrc}
									alt="Camera"
									className={`w-full max-h-[400px] object-contain ${flip ? "scale-y-[-1]" : ""}`}
								/>
							)
							: (
								<div className="flex flex-col items-center gap-2 text-muted-foreground">
									<VideoOff className="size-10" />
									<p className="text-sm">No camera feed available</p>
									<p className="text-xs">Click &quot;Connect&quot; to start streaming</p>
								</div>
							)}
					</div>
				</CardContent>
			</Card>

			{/* Controls */}
			<Card>
				<CardHeader>
					<CardTitle>Controls</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Connect / Disconnect */}
					<div className="flex flex-col gap-2">
						<Button onClick={connectStream} disabled={isConnected} className="w-full">
							<Video className="size-4 mr-2" />
							Connect
						</Button>
						<Button variant="outline" onClick={disconnectStream} disabled={!isConnected} className="w-full">
							<VideoOff className="size-4 mr-2" />
							Disconnect
						</Button>
					</div>

					{/* Mic mute/unmute */}
					<div className="flex flex-col gap-1">
						<Button
							onClick={() => micMuted ? unmuteMic() : muteMic(true)}
							disabled={!isConnected}
							className={`w-full font-semibold ${
								micMuted
									? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border"
									: "bg-red-600 hover:bg-red-500 text-white"
							}`}
						>
							{micMuted
								? <><Mic className="size-4 mr-2" />Unmute Mic</>
								: <><MicOff className="size-4 mr-2" />Mute Mic</>}
						</Button>
						<p className="text-[10px] text-muted-foreground text-center">
							{micMuted ? "Patient cannot hear you" : "Patient can hear you"}
						</p>
					</div>

					{/* D-Pad */}
					<div className="space-y-2">
						<p className="text-xs font-medium text-muted-foreground">Camera Position</p>
						<div className="grid grid-cols-3 gap-1 w-fit mx-auto">
							<div />
							<Button variant="ghost" size="icon" onClick={() => sendCameraControl("move-up")}>
								<ChevronUp className="size-4" />
							</Button>
							<div />
							<Button variant="ghost" size="icon" onClick={() => sendCameraControl("move-left")}>
								<ChevronLeft className="size-4" />
							</Button>
							<div className="size-9" />
							<Button variant="ghost" size="icon" onClick={() => sendCameraControl("move-right")}>
								<ChevronRight className="size-4" />
							</Button>
							<div />
							<Button variant="ghost" size="icon" onClick={() => sendCameraControl("move-down")}>
								<ChevronDown className="size-4" />
							</Button>
							<div />
						</div>
					</div>

					{/* Flip */}
					<Button variant="outline" onClick={() => setFlip(f => !f)} className="w-full">
						<FlipVertical className="size-4 mr-2" />
						Flip View
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
