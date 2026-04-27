"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "@/shared/components/ui/chart";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";

interface DevicePoint {
	name: string;
	uptime: number;
}

const chartConfig = {
	uptime: { label: "Uptime %", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function DeviceHealthChart({ data }: { data: DevicePoint[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Device Uptime</CardTitle>
				<CardDescription>Connected instruments · last 24h</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[220px] w-full aspect-auto">
					<BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
						<CartesianGrid horizontal={false} strokeDasharray="3 3" />
						<XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
						<YAxis
							type="category"
							dataKey="name"
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 11 }}
							width={110}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="uptime" fill="var(--color-uptime)" radius={[0, 4, 4, 0]} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
