"use client";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "@/shared/components/ui/chart";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";

interface VolumePoint {
	hour: string;
	readings: number;
}

const chartConfig = {
	readings: { label: "Readings", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ReadingsVolumeChart({ data }: { data: VolumePoint[] }) {
	const total = data.reduce((sum, d) => sum + d.readings, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Readings Volume</CardTitle>
				<CardDescription>
					{total.toLocaleString()}
					{" "}
					total readings · last 24 hours
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[200px] w-full aspect-auto">
					<AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
						<defs>
							<linearGradient id="readingsGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="var(--color-readings)" stopOpacity={0.4} />
								<stop offset="100%" stopColor="var(--color-readings)" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />
						<XAxis
							dataKey="hour"
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 11 }}
							interval={3}
						/>
						<YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<Area
							type="monotone"
							dataKey="readings"
							stroke="var(--color-readings)"
							strokeWidth={2}
							fill="url(#readingsGradient)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
