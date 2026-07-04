"use client";
import type { ReactNode } from "react";

import { Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/shared/components/ui/card";
import { ChartContainer } from "@/shared/components/ui/chart";
import { dataPaddedYAxisDomain, finiteChartPoints } from "@/shared/lib/chart-domain";
import { cn } from "@/shared/lib/utils";

interface VitalSignCardProps {
	title: string;
	value: string | number;
	unit: string;
	icon: ReactNode;
	data: Array<{ value: unknown }>;
	status?: "normal" | "warning" | "critical";
}

const statusColors = {
	normal: { stroke: "var(--chart-1)", fill: "var(--chart-1)" },
	warning: { stroke: "oklch(0.75 0.18 85)", fill: "oklch(0.75 0.18 85)" },
	critical: { stroke: "oklch(0.65 0.22 25)", fill: "oklch(0.65 0.22 25)" },
};

export function VitalSignCard({ title, value, unit, icon, data, status = "normal" }: VitalSignCardProps) {
	const colors = statusColors[status];
	const chartData = finiteChartPoints(data).map((point, index) => ({
		tick: String(index),
		value: point.value,
	}));
	const chartConfig = {
		value: { label: title, color: colors.stroke },
	};

	return (
		<Card size="sm">
			<CardContent className="space-y-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-muted-foreground">
						{icon}
						<span className="text-xs font-medium">{title}</span>
					</div>
					<span className={cn(
						"size-2 rounded-full",
						status === "normal" && "bg-emerald-500",
						status === "warning" && "bg-amber-500",
						status === "critical" && "bg-red-500",
					)}
					/>
				</div>
				<div className="flex items-baseline gap-1">
					<span className="text-2xl font-semibold">{value}</span>
					<span className="text-xs text-muted-foreground">{unit}</span>
				</div>
				{chartData.length > 0 && (
					<ChartContainer config={chartConfig} className="!aspect-auto h-[52px] w-full">
						<LineChart data={chartData} margin={{ top: 6, right: 8, bottom: 2, left: 8 }}>
							<XAxis
								dataKey="tick"
								type="category"
								allowDuplicatedCategory
								hide
								padding={{ left: 16, right: 16 }}
							/>
							<YAxis hide domain={dataPaddedYAxisDomain} width={0} />
							<Line
								type="linear"
								dataKey="value"
								stroke={colors.stroke}
								strokeWidth={1.5}
								dot={{ r: 2.5, fill: colors.stroke, strokeWidth: 0 }}
								activeDot={false}
								isAnimationActive={false}
								connectNulls
							/>
						</LineChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
