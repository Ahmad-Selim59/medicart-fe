"use client";
import type { ReactNode } from "react";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart } from "recharts";

import { Card, CardContent } from "@/shared/components/ui/card";
import { ChartContainer } from "@/shared/components/ui/chart";
import { cn } from "@/shared/lib/utils";

interface StatCardProps {
	title: string;
	value: string | number;
	icon: ReactNode;
	iconClassName?: string;
	trend?: "up" | "down";
	trendValue?: string;
	data?: Array<{ value: number }>;
	chartColor?: string;
}

const sparkConfig = { value: { label: "value", color: "var(--chart-1)" } };
const WHITESPACE_RE = /\s/g;

export function StatCard({ title, value, icon, iconClassName, trend, trendValue, data, chartColor = "var(--chart-1)" }: StatCardProps) {
	const gradientId = `spark-${title.replace(WHITESPACE_RE, "")}`;
	return (
		<Card size="sm">
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between">
					<div className={cn("flex items-center justify-center size-9 rounded-lg", iconClassName)}>
						{icon}
					</div>
					{trend && trendValue && (
						<span className={cn(
							"inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
							trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50",
						)}
						>
							{trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
							{trendValue}
						</span>
					)}
				</div>
				<div>
					<p className="text-xs text-muted-foreground">{title}</p>
					<p className="text-2xl font-semibold">{value}</p>
				</div>
				{data && data.length > 0 && (
					<ChartContainer config={sparkConfig} className="h-[40px] w-full aspect-auto">
						<AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
							<defs>
								<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
									<stop offset="100%" stopColor={chartColor} stopOpacity={0} />
								</linearGradient>
							</defs>
							<Area
								type="monotone"
								dataKey="value"
								stroke={chartColor}
								strokeWidth={1.5}
								fill={`url(#${gradientId})`}
								dot={false}
							/>
						</AreaChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
