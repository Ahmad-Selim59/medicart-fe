"use client";

import { useCallback, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, FlipVertical, Video, VideoOff } from "lucide-react";
import { StatusBadge } from "@/shared/components/custom/status-badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const REGEX_PATTERN = /\/$/;
const HTTP_TO_WS_PATTERN = /^http/;

import { Patient } from "@/shared/types/api";

export function CameraView({ patient }: { patient: Patient }) {
	const [camSrc, setCamSrc] = useState("");
	const [camStatus, setCamStatus] = useState<"disconnected" | "connected" | "streaming" | "error">("disconnected");
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [flip, setFlip] = useState(false);

	const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8081";

	const connectStream = useCallback(() => {
		if (ws)
			return;
		const base = (API_BASE || "").replace(REGEX_PATTERN, "");
		const httpUrl = `${base}/ws/stream?clinic=${encodeURIComponent(patient?.clinicId || "")}&patient=${encodeURIComponent(patient?.id || "")}`;
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
		setWs(sock);
	}, [ws, API_BASE, patient]);

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
				body: JSON.stringify({ command }),
			});
		} catch (error) {
			console.error("Failed to send camera command", error);
		}
	}

	const isConnected = camStatus === "connected" || camStatus === "streaming";

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
			{/* Camera Feed */}
			<Card className="lg:col-span-3">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Camera Feed</CardTitle>
						<StatusBadge status={isConnected ? "online" : camStatus === "error" ? "offline" : "offline"} />
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
