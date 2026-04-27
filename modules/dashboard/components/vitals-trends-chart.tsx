"use client";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "@/shared/components/ui/chart";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";

interface VitalsPoint {
	time: string;
	heartRate: number;
	systolic: number;
	glucose: number;
}

const chartConfig = {
	heartRate: { label: "Heart Rate (bpm)", color: "var(--chart-1)" },
	systolic: { label: "Systolic BP (mmHg)", color: "var(--chart-3)" },
	glucose: { label: "Glucose (mg/dL)", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function VitalsTrendsChart({ data }: { data: VitalsPoint[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Vitals Trends</CardTitle>
				<CardDescription>Average across all patients · last 24 hours</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[280px] w-full aspect-auto">
					<LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />
						<XAxis
							dataKey="time"
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 11 }}
							interval={3}
						/>
						<YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Line
							type="monotone"
							dataKey="heartRate"
							stroke="var(--color-heartRate)"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="systolic"
							stroke="var(--color-systolic)"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="glucose"
							stroke="var(--color-glucose)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
