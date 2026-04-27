"use client";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";

import type { ChartConfig } from "@/shared/components/ui/chart";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Patient } from "@/shared/types/api";

function formatTime(timestamp?: string): string {
	if (!timestamp)
		return "";
	return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const hrConfig = {
	pr: { label: "Heart Rate (bpm)", color: "oklch(0.65 0.22 15)" },
	spo2: { label: "SpO2 (%)", color: "oklch(0.65 0.15 250)" },
} satisfies ChartConfig;

const bpConfig = {
	sys: { label: "Systolic", color: "oklch(0.6 0.18 280)" },
	dia: { label: "Diastolic", color: "oklch(0.65 0.15 250)" },
} satisfies ChartConfig;

const glucoseConfig = {
	glu: { label: "Glucose (mg/dL)", color: "oklch(0.7 0.15 85)" },
} satisfies ChartConfig;

const tempConfig = {
	temp: { label: "Temperature (°C)", color: "oklch(0.65 0.2 30)" },
} satisfies ChartConfig;

export default function SensorData({ patient }: { patient: Patient }) {
	if (!patient)
		return null;

	const hrData = (patient.data?.heartRate ?? []).map((d: any) => ({
		time: formatTime(d.timestamp),
		pr: d.pr,
		spo2: d.spo2,
	}));

	const bpData = (patient.data?.bloodPressure ?? []).map((d: any) => ({
		time: formatTime(d.timestamp),
		sys: d.sys,
		dia: d.dia,
	}));

	const glucoseData = (patient.data?.glucose ?? []).map((d: any) => ({
		time: formatTime(d.timestamp),
		glu: d.glu,
	}));

	const tempData = (patient.data?.temperature ?? []).map((d: any) => ({
		time: formatTime(d.timestamp),
		temp: d.temp,
	}));

	return (
		<div className="space-y-6">
			{/* Heart Rate & SpO2 */}
			<Card>
				<CardHeader>
					<CardTitle>Heart Rate & SpO2</CardTitle>
					<CardDescription>Pulse rate and oxygen saturation over time</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={hrConfig} className="h-[300px] w-full aspect-auto">
						<LineChart data={hrData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
							<YAxis yAxisId="left" tickLine={false} axisLine={false} domain={[50, 130]} />
							<YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} domain={[85, 100]} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />
							<Line yAxisId="left" type="monotone" dataKey="pr" stroke="var(--color-pr)" strokeWidth={2} dot={false} />
							<Line yAxisId="right" type="monotone" dataKey="spo2" stroke="var(--color-spo2)" strokeWidth={2} dot={false} />
						</LineChart>
					</ChartContainer>
				</CardContent>
			</Card>

			{/* Blood Pressure */}
			<Card>
				<CardHeader>
					<CardTitle>Blood Pressure</CardTitle>
					<CardDescription>Systolic and diastolic pressure trends</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={bpConfig} className="h-[300px] w-full aspect-auto">
						<LineChart data={bpData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
							<YAxis tickLine={false} axisLine={false} domain={[50, 200]} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />
							<ReferenceLine y={140} stroke="oklch(0.7 0.15 25)" strokeDasharray="4 4" label={{ value: "High", position: "right", fontSize: 10 }} />
							<ReferenceLine y={90} stroke="oklch(0.7 0.15 25)" strokeDasharray="4 4" label={{ value: "Low", position: "right", fontSize: 10 }} />
							<Line type="monotone" dataKey="sys" stroke="var(--color-sys)" strokeWidth={2} dot={false} />
							<Line type="monotone" dataKey="dia" stroke="var(--color-dia)" strokeWidth={2} dot={false} />
						</LineChart>
					</ChartContainer>
				</CardContent>
			</Card>

			{/* Blood Glucose */}
			<Card>
				<CardHeader>
					<CardTitle>Blood Glucose</CardTitle>
					<CardDescription>Glucose levels over time (mg/dL)</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={glucoseConfig} className="h-[300px] w-full aspect-auto">
						<AreaChart data={glucoseData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
							<YAxis tickLine={false} axisLine={false} domain={[50, 280]} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ReferenceLine y={140} stroke="oklch(0.7 0.15 25)" strokeDasharray="4 4" label={{ value: "High", position: "right", fontSize: 10 }} />
							<ReferenceLine y={70} stroke="oklch(0.7 0.15 25)" strokeDasharray="4 4" label={{ value: "Low", position: "right", fontSize: 10 }} />
							<defs>
								<linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="var(--color-glu)" stopOpacity={0.3} />
									<stop offset="100%" stopColor="var(--color-glu)" stopOpacity={0.05} />
								</linearGradient>
							</defs>
							<Area type="monotone" dataKey="glu" stroke="var(--color-glu)" strokeWidth={2} fill="url(#glucoseGradient)" dot={false} />
						</AreaChart>
					</ChartContainer>
				</CardContent>
			</Card>

			{/* Temperature */}
			<Card>
				<CardHeader>
					<CardTitle>Body Temperature</CardTitle>
					<CardDescription>Temperature readings over time (°C)</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={tempConfig} className="h-[300px] w-full aspect-auto">
						<LineChart data={tempData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
							<YAxis tickLine={false} axisLine={false} domain={[35.5, 40]} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ReferenceLine y={37.2} stroke="oklch(0.7 0.15 25)" strokeDasharray="4 4" label={{ value: "High", position: "right", fontSize: 10 }} />
							<ReferenceLine y={36.1} stroke="oklch(0.7 0.15 25)" strokeDasharray="4 4" label={{ value: "Low", position: "right", fontSize: 10 }} />
							<Line type="monotone" dataKey="temp" stroke="var(--color-temp)" strokeWidth={2} dot={{ r: 3 }} />
						</LineChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</div>
	);
}
