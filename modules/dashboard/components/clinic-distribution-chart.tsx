"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "@/shared/components/ui/chart";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";

interface ClinicData {
	name: string;
	patients: number;
}

const chartConfig = {
	patients: {
		label: "Patients",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export function ClinicDistributionChart({ data }: { data: ClinicData[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Patient Distribution</CardTitle>
				<CardDescription>Patients across clinic locations</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[250px] w-full aspect-auto">
					<BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />
						<XAxis
							dataKey="name"
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 11 }}
							tickFormatter={v => v.length > 12 ? `${v.slice(0, 12)}…` : v}
						/>
						<YAxis tickLine={false} axisLine={false} allowDecimals={false} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="patients" fill="var(--color-patients)" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
