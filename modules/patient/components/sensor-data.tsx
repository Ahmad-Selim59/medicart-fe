"use client";
import {
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
import { paddedDomainFromValues, toChartNumber } from "@/shared/lib/chart-domain";
import { Patient } from "@/shared/types/api";

function formatTime(timestamp?: string): string {
	if (!timestamp)
		return "";
	return new Date(timestamp).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

function mapReadings<T>(
	readings: T[] | undefined,
	mapper: (reading: T, index: number) => { time: string; [key: string]: string | number | undefined },
) {
	return (readings ?? [])
		.map((reading, index) => mapper(reading, index))
		.filter(row => Object.entries(row).some(([key, value]) => key !== "time" && value !== undefined));
}

function latestValue(values: (number | undefined)[]): string {
	const last = [...values].reverse().find(v => v !== undefined);
	return last !== undefined ? String(last) : "—";
}

const prConfig = {
	pr: { label: "Heart Rate (bpm)", color: "oklch(0.65 0.22 15)" },
} satisfies ChartConfig;

const spo2Config = {
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

function EmptyChart({ message }: { message: string }) {
	return (
		<div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
			{message}
		</div>
	);
}

interface MetricChartProps {
	title: string;
	description: string;
	latest?: string;
	unit?: string;
	data: Array<{ time: string; [key: string]: string | number | undefined }>;
	config: ChartConfig;
	emptyMessage: string;
	dataKeys: string[];
	domain: [number, number];
	referenceLines?: Array<{ y: number; label: string }>;
}

function MetricChart({
	title,
	description,
	latest,
	unit,
	data,
	config,
	emptyMessage,
	dataKeys,
	domain,
	referenceLines = [],
}: MetricChartProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-4">
					<div>
						<CardTitle>{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
					{latest !== undefined && (
						<div className="text-right shrink-0">
							<p className="text-2xl font-semibold tabular-nums">{latest}</p>
							{unit && <p className="text-xs text-muted-foreground">{unit}</p>}
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<EmptyChart message={emptyMessage} />
				) : (
					<ChartContainer config={config} className="!aspect-auto h-[260px] w-full">
						<LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
							<YAxis tickLine={false} axisLine={false} domain={domain} width={40} />
							<ChartTooltip content={<ChartTooltipContent />} />
							{dataKeys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
							{referenceLines.map(line => (
								<ReferenceLine
									key={line.label}
									y={line.y}
									stroke="oklch(0.7 0.15 25)"
									strokeDasharray="4 4"
									label={{ value: line.label, position: "right", fontSize: 10 }}
								/>
							))}
							{dataKeys.map(key => (
								<Line
									key={key}
									type="linear"
									dataKey={key}
									stroke={`var(--color-${key})`}
									strokeWidth={2}
									dot={{ r: 4 }}
									activeDot={{ r: 5 }}
									isAnimationActive={false}
									connectNulls
								/>
							))}
						</LineChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}

export default function SensorData({ patient }: { patient: Patient }) {
	if (!patient)
		return null;

	const hrData = mapReadings(patient.data?.heartRate, (d, index) => ({
		time: formatTime(d.timestamp) || `#${index + 1}`,
		pr: toChartNumber(d.pr),
	}));

	const spo2Data = mapReadings(patient.data?.heartRate, (d, index) => ({
		time: formatTime(d.timestamp) || `#${index + 1}`,
		spo2: toChartNumber(d.spo2),
	}));

	const bpData = mapReadings(patient.data?.bloodPressure, (d, index) => ({
		time: formatTime(d.timestamp) || `#${index + 1}`,
		sys: toChartNumber(d.sys),
		dia: toChartNumber(d.dia),
	}));

	const glucoseData = mapReadings(patient.data?.glucose, (d, index) => ({
		time: formatTime(d.timestamp) || `#${index + 1}`,
		glu: toChartNumber(d.glu),
	}));

	const tempData = mapReadings(patient.data?.temperature, (d, index) => ({
		time: formatTime(d.timestamp) || `#${index + 1}`,
		temp: toChartNumber(d.temp),
	}));

	const prDomain = paddedDomainFromValues(hrData.map(d => d.pr).filter((v): v is number => typeof v === "number"));
	const spo2Domain = paddedDomainFromValues(spo2Data.map(d => d.spo2).filter((v): v is number => typeof v === "number"));
	const bpDomain = paddedDomainFromValues(bpData.flatMap(d => [d.sys, d.dia].filter((v): v is number => typeof v === "number")));
	const glucoseDomain = paddedDomainFromValues(glucoseData.map(d => d.glu).filter((v): v is number => typeof v === "number"));
	const tempDomain = paddedDomainFromValues(tempData.map(d => d.temp).filter((v): v is number => typeof v === "number"));

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<MetricChart
				title="Heart Rate"
				description="Pulse rate over time"
				latest={latestValue(hrData.map(d => typeof d.pr === "number" ? d.pr : undefined))}
				unit="bpm"
				data={hrData}
				config={prConfig}
				emptyMessage="No heart rate readings yet"
				dataKeys={["pr"]}
				domain={prDomain}
			/>
			<MetricChart
				title="SpO2"
				description="Oxygen saturation over time"
				latest={latestValue(spo2Data.map(d => typeof d.spo2 === "number" ? d.spo2 : undefined))}
				unit="%"
				data={spo2Data}
				config={spo2Config}
				emptyMessage="No SpO2 readings yet"
				dataKeys={["spo2"]}
				domain={spo2Domain}
			/>
			<MetricChart
				title="Blood Pressure"
				description="Systolic and diastolic pressure trends"
				latest={
					bpData.length > 0
						? `${latestValue(bpData.map(d => typeof d.sys === "number" ? d.sys : undefined))}/${latestValue(bpData.map(d => typeof d.dia === "number" ? d.dia : undefined))}`
						: "—"
				}
				unit="mmHg"
				data={bpData}
				config={bpConfig}
				emptyMessage="No blood pressure readings yet"
				dataKeys={["sys", "dia"]}
				domain={bpDomain}
				referenceLines={[
					{ y: 140, label: "High" },
					{ y: 90, label: "Low" },
				]}
			/>
			<MetricChart
				title="Blood Glucose"
				description="Glucose levels over time"
				latest={latestValue(glucoseData.map(d => typeof d.glu === "number" ? d.glu : undefined))}
				unit="mg/dL"
				data={glucoseData}
				config={glucoseConfig}
				emptyMessage="No glucose readings yet"
				dataKeys={["glu"]}
				domain={glucoseDomain}
				referenceLines={[
					{ y: 140, label: "High" },
					{ y: 70, label: "Low" },
				]}
			/>
			<MetricChart
				title="Body Temperature"
				description="Temperature readings over time"
				latest={latestValue(tempData.map(d => typeof d.temp === "number" ? d.temp : undefined))}
				unit="°C"
				data={tempData}
				config={tempConfig}
				emptyMessage="No temperature readings yet"
				dataKeys={["temp"]}
				domain={tempDomain}
				referenceLines={[
					{ y: 37.2, label: "High" },
					{ y: 36.1, label: "Low" },
				]}
			/>
		</div>
	);
}
