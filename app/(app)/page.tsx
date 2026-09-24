import { ClinicDistributionChart } from "@/modules/dashboard/components/clinic-distribution-chart";
import { PatientStatusDonut } from "@/modules/dashboard/components/patient-status-donut";
import { StatCards } from "@/modules/dashboard/components/stat-cards";

import { BackendConnectionAlert } from "@/shared/components/custom/backend-connection-alert";
import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { fetchBackend } from "@/shared/api/client";
import { backendAuthHeaders, getAppSession } from "@/shared/lib/auth/app-session";

export const revalidate = 0;

export default async function DashboardPage() {
	const session = await getAppSession();
	if (!session) {
		return null;
	}

	const { response: res, unreachable: backendUnreachable } = await fetchBackend(
		`/api/dashboard${session.allowedClinicsQuery}`,
		{
			headers: backendAuthHeaders(session.token),
		},
	);

	if (res && !res.ok) {
		console.error("Failed to fetch dashboard data:", await res.text());
	}

	const data = res?.ok ? await res.json() : { quickStats: {} };
	const {
		quickStats,
		patientStatus,
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
			</header>

			<div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
				{backendUnreachable && <BackendConnectionAlert />}
				<StatCards
					totalPatients={quickStats.totalPatients || 0}
					activeClinics={quickStats.activeClinics || 0}
					activeDevices={quickStats.activeDevices || 0}
					alertsCount={quickStats.alertsCount || 0}
					trends={quickStats.trends || {
						totalPatients: [],
						activeClinics: [],
						activeDevices: [],
						alertsCount: [],
					}}
				/>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<ClinicDistributionChart
							data={clinicDistribution || []}
							totalPatients={quickStats.totalPatients || 0}
						/>
					</div>
					<PatientStatusDonut data={patientStatus || []} />
				</div>
			</div>
		</>
	);
}
