import { AlertsTrendChart } from "@/modules/dashboard/components/alerts-trend-chart";
import { ClinicDistributionChart } from "@/modules/dashboard/components/clinic-distribution-chart";
import { DeviceHealthChart } from "@/modules/dashboard/components/device-health-chart";
import { PatientStatusDonut } from "@/modules/dashboard/components/patient-status-donut";
import { ReadingsVolumeChart } from "@/modules/dashboard/components/readings-volume-chart";
import { StatCards } from "@/modules/dashboard/components/stat-cards";
import { VitalsTrendsChart } from "@/modules/dashboard/components/vitals-trends-chart";

import { Download } from "lucide-react";
import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

export const revalidate = 0; // Disable static caching

export default async function DashboardPage() {
	const res = await fetch("http://localhost:8081/api/dashboard");
	const data = await res.json();
	const {
		quickStats,
		patientStatus,
		deviceHealth,
		readingsVolume,
		vitalsTrends,
		alertsTrend,
		clinicDistribution,
	} = data;

	return (
		<>
			<header className="sticky top-0 z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-background/80 backdrop-blur border-b">
				<SidebarTrigger className="-ml-1 shrink-0" />
				<Separator orientation="vertical" className="h-9/10 shrink-0" />
				<div className="flex-1 min-w-0">
					<h1 className="text-sm sm:text-base font-semibold leading-tight truncate">Overview</h1>
					<p className="hidden sm:block text-xs text-muted-foreground truncate">Real-time monitoring across all clinics</p>
				</div>
				<ThemeToggle />
				<Button size="sm" className="shrink-0">
					<Download className="size-4" />
					<span className="hidden sm:inline">Export Report</span>
				</Button>
			</header>
			
			<div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
				<StatCards
					totalPatients={quickStats.totalPatients}
					activeClinics={quickStats.activeClinics}
					activeDevices={quickStats.activeDevices}
					alertsCount={quickStats.alertsCount}
					trends={quickStats.trends}
				/>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<VitalsTrendsChart data={vitalsTrends} />
					</div>
					<PatientStatusDonut data={patientStatus} />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<ReadingsVolumeChart data={readingsVolume} />
					<AlertsTrendChart data={alertsTrend} />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<ClinicDistributionChart data={clinicDistribution} />
					<DeviceHealthChart data={deviceHealth} />
				</div>
			</div>
		</>
	);
}
