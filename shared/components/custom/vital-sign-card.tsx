"use client";
import type { ReactNode } from "react";

import { Area, AreaChart } from "recharts";

import { Card, CardContent } from "@/shared/components/ui/card";
import { ChartContainer } from "@/shared/components/ui/chart";
import { cn } from "@/shared/lib/utils";

interface VitalSignCardProps {
	title: string;
	value: string | number;
	unit: string;
	icon: ReactNode;
	data: Array<{ value: number }>;
	status?: "normal" | "warning" | "critical";
}

const WHITESPACE_RE = /\s/g;

const statusColors = {
	normal: { stroke: "var(--chart-1)", fill: "var(--chart-1)" },
	warning: { stroke: "oklch(0.75 0.18 85)", fill: "oklch(0.75 0.18 85)" },
	critical: { stroke: "oklch(0.65 0.22 25)", fill: "oklch(0.65 0.22 25)" },
};

export function VitalSignCard({ title, value, unit, icon, data, status = "normal" }: VitalSignCardProps) {
	const colors = statusColors[status];
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
				{data.length > 0 && (
					<ChartContainer config={chartConfig} className="h-[50px] w-full aspect-auto">
						<AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
							<defs>
								<linearGradient id={`gradient-${title.replace(WHITESPACE_RE, "")}`} x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor={colors.fill} stopOpacity={0.3} />
									<stop offset="100%" stopColor={colors.fill} stopOpacity={0.05} />
								</linearGradient>
							</defs>
							<Area
								type="monotone"
								dataKey="value"
								stroke={colors.stroke}
								strokeWidth={1.5}
								fill={`url(#gradient-${title.replace(WHITESPACE_RE, "")})`}
								dot={false}
							/>
						</AreaChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
