"use client";
import { Cell, Label, Pie, PieChart } from "recharts";

import type { ChartConfig } from "@/shared/components/ui/chart";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";

interface StatusSlice {
	name: string;
	value: number;
	fill: string;
}

const chartConfig = {
	value: { label: "Patients" },
	Stable: { label: "Stable", color: "var(--chart-2)" },
	Warning: { label: "Warning", color: "var(--chart-4)" },
	Critical: { label: "Critical", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function PatientStatusDonut({ data }: { data: StatusSlice[] }) {
	const total = data.reduce((sum, d) => sum + d.value, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Patient Status</CardTitle>
				<CardDescription>Current health distribution</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[220px] w-full aspect-auto">
					<PieChart>
						<ChartTooltip content={<ChartTooltipContent hideLabel />} />
						<Pie
							data={data}
							dataKey="value"
							nameKey="name"
							innerRadius={60}
							outerRadius={90}
							strokeWidth={2}
						>
							{data.map(entry => <Cell key={entry.name} fill={entry.fill} />)}
							<Label
								content={({ viewBox }) => {
									if (!viewBox || !("cx" in viewBox))
										return null;
									return (
										<text
											x={viewBox.cx}
											y={viewBox.cy}
											textAnchor="middle"
											dominantBaseline="middle"
										>
											<tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold">
												{total}
											</tspan>
											<tspan
												x={viewBox.cx}
												y={(viewBox.cy ?? 0) + 18}
												className="fill-muted-foreground text-xs"
											>
												patients
											</tspan>
										</text>
									);
								}}
							/>
						</Pie>
					</PieChart>
				</ChartContainer>
				<div className="grid grid-cols-3 gap-2 mt-2">
					{data.map(slice => (
						<div key={slice.name} className="flex flex-col items-center">
							<div className="flex items-center gap-1.5">
								<span className="size-2 rounded-full" style={{ backgroundColor: slice.fill }} />
								<span className="text-xs text-muted-foreground">{slice.name}</span>
							</div>
							<span className="text-sm font-semibold">{slice.value}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
