"use client";

import { useCallback, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, FlipVertical, Video, VideoOff, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/shared/components/custom/status-badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const REGEX_PATTERN = /\/$/;
const HTTP_TO_WS_PATTERN = /^http/;

import { API_BASE } from "@/shared/api/client";

interface FacilityCameraViewProps {
	clinicName: string;
}

export function FacilityCameraView({ clinicName }: FacilityCameraViewProps) {
	const [camSrc, setCamSrc] = useState("");
	const [camStatus, setCamStatus] = useState<"disconnected" | "connected" | "streaming" | "error">("disconnected");
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [flip, setFlip] = useState(false);

	const connectStream = useCallback(() => {
		if (ws) return;
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		// Note: patient is explicitly empty for facility-level stream
		const httpUrl = `${base}/ws/stream?clinic=${encodeURIComponent(clinicName)}&patient=`;
		const wsUrl = httpUrl.startsWith("ws") ? httpUrl : httpUrl.replace(HTTP_TO_WS_PATTERN, "ws");
		
		const sock = new WebSocket(wsUrl);
		sock.binaryType = "arraybuffer";
		sock.onopen = () => {
			setCamStatus("connected");
			setWs(sock);
		};
		sock.onclose = () => {
			setCamStatus("disconnected");
			setWs(null);
			setCamSrc("");
		};
		sock.onerror = () => {
			setCamStatus("error");
		};
		sock.onmessage = (ev) => {
			if (ev.data instanceof ArrayBuffer) {
				const blob = new Blob([ev.data], { type: "image/jpeg" });
				const urlObj = URL.createObjectURL(blob);
				setCamSrc(urlObj);
				setCamStatus("streaming");
			}
		};
	}, [ws, API_BASE, clinicName]);

	const disconnectStream = useCallback(() => {
		if (ws) {
			ws.close();
			setWs(null);
		}
	}, [ws]);

	async function sendCameraControl(command: string) {
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		try {
			await fetch(`${base}/api/camera/control`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ 
					clinic_name: clinicName,
					command 
				}),
			});
		} catch (error) {
			console.error("Failed to send camera command", error);
		}
	}

	const isConnected = camStatus === "connected" || camStatus === "streaming";

	return (
		<div className="space-y-6">
			{/* Large Monitor Section */}
			<Card className="overflow-hidden border-none shadow-2xl bg-zinc-950">
				<CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-900/50">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-emerald-500/10">
							<Video className="size-5 text-emerald-500" />
						</div>
						<div>
							<CardTitle className="text-base font-bold text-white tracking-tight">Facility Live Stream</CardTitle>
							<p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{clinicName} • Secure Link</p>
						</div>
					</div>
					<StatusBadge status={isConnected ? "online" : camStatus === "error" ? "offline" : "offline"} />
				</CardHeader>
				
				<CardContent className="p-0">
					<div className="relative w-full bg-black aspect-video flex items-center justify-center group overflow-hidden">
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
						
						{/* HUD Overlay */}
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
								
								<div className="absolute bottom-6 right-6 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
									<span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ISO 400 • 1/60 • f/2.8</span>
								</div>
							</>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Control Console Section */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Connection Controls */}
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
					</CardContent>
				</Card>

				{/* Directional Pad */}
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

				{/* Utility Actions */}
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
