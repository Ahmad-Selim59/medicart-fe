"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImagePlus, MessageSquare, Send } from "lucide-react";
import { StatusBadge } from "@/shared/components/custom/status-badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { API_BASE } from "@/shared/api/client";

const REGEX_PATTERN = /\/$/;
const HTTP_TO_WS_PATTERN = /^http/;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

interface ChatMessage {
	id: string;
	sender: string;
	role: string;
	text: string;
	image?: string;
	imageMime?: string;
	timestamp: string;
}

interface ClinicChatProps {
	clinicName: string;
	senderName: string;
	enabled?: boolean;
	compact?: boolean;
	embedded?: boolean;
}

function formatTime(ts: string): string {
	if (!ts) return "";
	const d = new Date(ts);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function chatWSURL(base: string): string {
	const trimmed = base.replace(REGEX_PATTERN, "");
	const ws = trimmed.startsWith("ws")
		? trimmed
		: trimmed.replace(HTTP_TO_WS_PATTERN, "ws");
	return `${ws}/ws/chat`;
}

function fileExtension(mime: string): string {
	switch (mime) {
		case "image/png": return "png";
		case "image/gif": return "gif";
		case "image/webp": return "webp";
		default: return "jpg";
	}
}

async function prepareImageFile(file: File): Promise<{ image: string; image_mime: string }> {
	if (!file.type.startsWith("image/")) {
		throw new Error("Only image files are supported");
	}

	const loadImage = () =>
		new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error("Could not read image"));
			img.src = URL.createObjectURL(file);
		});

	const img = await loadImage();
	URL.revokeObjectURL(img.src);

	let width = img.width;
	let height = img.height;
	const maxDim = 1600;
	if (width > maxDim || height > maxDim) {
		const scale = maxDim / Math.max(width, height);
		width = Math.round(width * scale);
		height = Math.round(height * scale);
	}

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not process image");
	ctx.drawImage(img, 0, 0, width, height);

	const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
	const quality = mime === "image/jpeg" ? 0.85 : undefined;
	let dataUrl = canvas.toDataURL(mime, quality);

	while (dataUrl.length * 0.75 > MAX_IMAGE_BYTES && mime === "image/jpeg") {
		const smaller = document.createElement("canvas");
		smaller.width = Math.max(1, Math.round(canvas.width * 0.8));
		smaller.height = Math.max(1, Math.round(canvas.height * 0.8));
		const sctx = smaller.getContext("2d");
		if (!sctx) break;
		sctx.drawImage(canvas, 0, 0, smaller.width, smaller.height);
		canvas.width = smaller.width;
		canvas.height = smaller.height;
		ctx.drawImage(smaller, 0, 0);
		dataUrl = canvas.toDataURL("image/jpeg", 0.75);
	}

	const comma = dataUrl.indexOf(",");
	const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
	if (base64.length * 0.75 > MAX_IMAGE_BYTES) {
		throw new Error("Image is too large (max 2 MB)");
	}

	return { image: base64, image_mime: mime };
}

function downloadImage(msg: ChatMessage) {
	if (!msg.image || !msg.imageMime) return;
	const link = document.createElement("a");
	link.href = `data:${msg.imageMime};base64,${msg.image}`;
	link.download = `chat-${msg.id}.${fileExtension(msg.imageMime)}`;
	link.click();
}

export function ClinicChat({
	clinicName,
	senderName,
	enabled = true,
	compact = false,
	embedded = false,
}: ClinicChatProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [status, setStatus] = useState<"disconnected" | "connected" | "error">("disconnected");
	const [sendingImage, setSendingImage] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	const disconnect = useCallback(() => {
		wsRef.current?.close();
		wsRef.current = null;
		setStatus("disconnected");
	}, []);

	const connect = useCallback(() => {
		if (wsRef.current || !clinicName) return;

		const sock = new WebSocket(chatWSURL(API_BASE || "http://localhost:8081"));
		wsRef.current = sock;

		sock.onopen = () => {
			setStatus("connected");
			sock.send(JSON.stringify({
				type: "register",
				clinic_name: clinicName,
				sender: senderName || "Doctor",
				role: "doctor",
			}));
		};

		sock.onclose = () => {
			wsRef.current = null;
			setStatus("disconnected");
		};

		sock.onerror = () => setStatus("error");

		sock.onmessage = (ev) => {
			try {
				const payload = JSON.parse(ev.data as string);
				if (payload.type !== "chat") return;
				setMessages((prev) => [
					...prev,
					{
						id: `${payload.timestamp}-${prev.length}`,
						sender: payload.sender || "Unknown",
						role: payload.role || "",
						text: payload.text || "",
						image: payload.image || undefined,
						imageMime: payload.image_mime || undefined,
						timestamp: payload.timestamp || "",
					},
				]);
			} catch {
				// ignore malformed messages
			}
		};
	}, [clinicName, senderName]);

	useEffect(() => {
		if (enabled) {
			connect();
		} else {
			disconnect();
		}
		return () => disconnect();
	}, [enabled, connect, disconnect]);

	const sendPayload = useCallback((payload: Record<string, string>) => {
		const sock = wsRef.current;
		if (!sock || sock.readyState !== WebSocket.OPEN) return false;
		sock.send(JSON.stringify({ type: "chat", ...payload }));
		return true;
	}, []);

	const sendMessage = useCallback(() => {
		const text = input.trim();
		if (!text) return;
		if (sendPayload({ text })) {
			setInput("");
		}
	}, [input, sendPayload]);

	const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		setSendingImage(true);
		try {
			const { image, image_mime } = await prepareImageFile(file);
			const caption = input.trim();
			const payload: Record<string, string> = { image, image_mime };
			if (caption) payload.text = caption;
			if (!sendPayload(payload)) {
				throw new Error("Chat not connected");
			}
			if (caption) setInput("");
		} catch (err) {
			console.error("Image send failed:", err);
			alert(err instanceof Error ? err.message : "Failed to send image");
		} finally {
			setSendingImage(false);
		}
	}, [input, sendPayload]);

	const isConnected = status === "connected";

	const emptyMessage = !enabled
		? "Chat unavailable"
		: isConnected
			? "No messages yet. Say hello to the clinic nurse."
			: status === "error"
				? "Chat connection failed — retrying…"
				: "Connecting to clinic chat…";

	const wrapperClass = embedded
		? "rounded-b-lg border border-t-0 bg-card shadow-sm"
		: "flex flex-col h-full min-h-[320px]";

	return (
		<Card className={`${wrapperClass} ${compact ? "border-none shadow-none" : ""}`}>
			{!embedded && (
			<CardHeader className={compact ? "pb-2 px-4 pt-4" : "pb-3"}>
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<MessageSquare className="size-4 text-muted-foreground" />
						<CardTitle className={compact ? "text-sm" : "text-base"}>Clinic Chat</CardTitle>
					</div>
					<StatusBadge status={isConnected ? "online" : "offline"} size="sm" />
				</div>
				{!compact && (
					<p className="text-xs text-muted-foreground">
						{isConnected
							? "Live chat with the clinic nurse."
							: "Connecting to clinic chat…"}
					</p>
				)}
			</CardHeader>
			)}
			{embedded && (
				<div className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-muted/30">
					<div className="flex items-center gap-2">
						<MessageSquare className="size-3.5 text-muted-foreground" />
						<span className="text-xs font-semibold">Chat</span>
					</div>
					<StatusBadge status={isConnected ? "online" : "offline"} size="sm" />
				</div>
			)}
			<CardContent className={`flex flex-col flex-1 gap-3 ${embedded ? "p-3" : "pt-0"} ${compact ? "px-4 pb-4" : ""}`}>
				<div className={`flex-1 overflow-y-auto rounded-lg border bg-muted/30 p-3 space-y-3 ${compact ? "min-h-[160px] max-h-[240px]" : "min-h-[200px] max-h-[360px]"}`}>
					{messages.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-6">
							{emptyMessage}
						</p>
					) : (
						messages.map((msg) => {
							const isDoctor = msg.role === "doctor";
							return (
								<div
									key={msg.id}
									className={`flex flex-col gap-0.5 ${isDoctor ? "items-end" : "items-start"}`}
								>
									<span className="text-[10px] text-muted-foreground">
										{msg.sender}
										{msg.timestamp ? ` · ${formatTime(msg.timestamp)}` : ""}
									</span>
									<div
										className={`rounded-lg px-3 py-2 text-sm max-w-[85%] space-y-2 ${
											isDoctor
												? "bg-primary text-primary-foreground"
												: "bg-background border"
										}`}
									>
										{msg.image && msg.imageMime && (
											<div className="relative group">
												<img
													src={`data:${msg.imageMime};base64,${msg.image}`}
													alt="Chat attachment"
													className="max-w-full max-h-48 rounded-md object-contain bg-black/5"
												/>
												<Button
													type="button"
													variant="secondary"
													size="icon"
													className="absolute top-1 right-1 size-7 opacity-0 group-hover:opacity-100 transition-opacity"
													onClick={() => downloadImage(msg)}
													title="Download image"
												>
													<Download className="size-3.5" />
												</Button>
											</div>
										)}
										{msg.text && <p>{msg.text}</p>}
									</div>
								</div>
							);
						})
					)}
					<div ref={messagesEndRef} />
				</div>
				<form
					className="flex gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						sendMessage();
					}}
				>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleImageSelect}
					/>
					<Button
						type="button"
						variant="outline"
						size="icon"
						disabled={!isConnected || sendingImage}
						onClick={() => fileInputRef.current?.click()}
						title="Attach image"
					>
						<ImagePlus className="size-4" />
					</Button>
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={isConnected ? "Message the clinic nurse…" : "Chat unavailable"}
						disabled={!isConnected || sendingImage}
						className="flex-1"
					/>
					<Button type="submit" size="icon" disabled={!isConnected || !input.trim() || sendingImage}>
						<Send className="size-4" />
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
