"use client";
import { Building2, Users, Wifi } from "lucide-react";

import { StatCard } from "@/shared/components/custom/stat-card";

interface TrendPoint {
	value: number;
}

interface StatCardsProps {
	totalPatients: number;
	activeClinics: number;
	activeDevices: number;
	alertsCount: number;
	trends: {
		totalPatients: TrendPoint[];
		activeClinics: TrendPoint[];
		activeDevices: TrendPoint[];
		alertsCount: TrendPoint[];
	};
}

export function StatCards({ totalPatients, activeClinics, activeDevices, alertsCount, trends }: StatCardsProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			<StatCard
				title="Total Patients"
				value={totalPatients}
				icon={<Users className="size-5 text-blue-600" />}
				iconClassName="bg-blue-50"
				data={trends.totalPatients}
				chartColor="oklch(0.6 0.18 260)"
			/>
			<StatCard
				title="Active Clinics"
				value={activeClinics}
				icon={<Building2 className="size-5 text-emerald-600" />}
				iconClassName="bg-emerald-50"
				data={trends.activeClinics}
				chartColor="oklch(0.65 0.18 150)"
			/>
			<StatCard
				title="Active Devices"
				value={activeDevices}
				icon={<Wifi className="size-5 text-violet-600" />}
				iconClassName="bg-violet-50"
				data={trends.activeDevices}
				chartColor="oklch(0.6 0.2 300)"
			/>
		</div>
	);
}
