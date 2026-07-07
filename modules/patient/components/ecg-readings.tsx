"use client";

import { Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { EcgReading, Patient } from "@/shared/types/api";

function formatTime(timestamp?: string): string {
	if (!timestamp) return "Unknown time";
	const d = new Date(timestamp);
	if (Number.isNaN(d.getTime())) return "Unknown time";
	return d.toLocaleString([], {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function fileExtension(mime: string): string {
	switch (mime) {
		case "image/png": return "png";
		case "image/gif": return "gif";
		case "image/webp": return "webp";
		default: return "jpg";
	}
}

function downloadEcg(reading: EcgReading, index: number) {
	if (!reading.image || !reading.image_mime) return;
	const link = document.createElement("a");
	link.href = `data:${reading.image_mime};base64,${reading.image}`;
	link.download = `ecg-${index + 1}.${fileExtension(reading.image_mime)}`;
	link.click();
}

export function EcgReadings({ patient }: { patient: Patient }) {
	const ecgList = patient.data?.ecg ?? [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>ECG Readings</CardTitle>
				<CardDescription>Uploaded electrocardiogram images from the clinic</CardDescription>
			</CardHeader>
			<CardContent>
				{ecgList.length === 0 ? (
					<div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
						No ECG readings yet
					</div>
				) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{ecgList.map((reading, index) => (
						<div
							key={`${reading.timestamp ?? "ecg"}-${index}`}
							className="rounded-lg border bg-muted/20 overflow-hidden"
						>
							{reading.image && reading.image_mime ? (
								<img
									src={`data:${reading.image_mime};base64,${reading.image}`}
									alt={`ECG reading ${index + 1}`}
									className="w-full max-h-64 object-contain bg-white"
								/>
							) : (
								<div className="p-8 text-center text-sm text-muted-foreground">
									Image unavailable
								</div>
							)}
							<div className="flex items-center justify-between gap-2 p-3 border-t bg-background/80">
								<span className="text-xs text-muted-foreground">
									{formatTime(reading.timestamp)}
								</span>
								{reading.image && reading.image_mime && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => downloadEcg(reading, index)}
									>
										<Download className="size-3.5 mr-1.5" />
										Download
									</Button>
								)}
							</div>
						</div>
					))}
				</div>
				)}
			</CardContent>
		</Card>
	);
}
