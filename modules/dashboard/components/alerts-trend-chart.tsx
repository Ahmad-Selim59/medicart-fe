"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "@/shared/components/ui/chart";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";

interface AlertsPoint {
	day: string;
	critical: number;
	warning: number;
}

const chartConfig = {
	critical: { label: "Critical", color: "var(--chart-5)" },
	warning: { label: "Warning", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function AlertsTrendChart({ data }: { data: AlertsPoint[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Alerts Trend</CardTitle>
				<CardDescription>Past 7 days</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[200px] w-full aspect-auto">
					<BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />
						<XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
						<YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Bar dataKey="warning" stackId="a" fill="var(--color-warning)" radius={[0, 0, 0, 0]} />
						<Bar dataKey="critical" stackId="a" fill="var(--color-critical)" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
