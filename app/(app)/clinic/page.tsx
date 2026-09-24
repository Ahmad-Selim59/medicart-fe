import { ClinicsTable } from "@/modules/clinic/components/clinics-table";
import { BackendConnectionAlert } from "@/shared/components/custom/backend-connection-alert";
import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { fetchBackend } from "@/shared/api/client";
import { backendAuthHeaders, getAppSession } from "@/shared/lib/auth/app-session";
import type { Clinic } from "@/shared/types/api";

import { AddClinicButton } from "./add-clinic-button";

export const revalidate = 0;

export default async function ClinicListPage() {
	const session = await getAppSession();
	if (!session) {
		return null;
	}

	const { response: res, unreachable: backendUnreachable } = await fetchBackend(
		`/api/clinics${session.allowedClinicsQuery}`,
		{
			headers: backendAuthHeaders(session.token),
		},
	);

	let clinicList: Clinic[] = res?.ok ? ((await res.json()) || []) : [];
	clinicList = clinicList.filter((clinic) => session.clinicNames.includes(clinic.name));

	return (
		<>
			<header className="sticky top-0 z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-background/80 backdrop-blur border-b">
				<SidebarTrigger className="-ml-1 shrink-0" />
				<Separator orientation="vertical" className="h-9/10 shrink-0" />
				<div className="flex-1 min-w-0">
					<h1 className="text-sm sm:text-base font-semibold leading-tight truncate">Clinics</h1>
					<p className="hidden sm:block text-xs text-muted-foreground truncate">Connected facilities</p>
				</div>
				<ThemeToggle />
				{session.isAdmin && <AddClinicButton />}
			</header>

			<div className="mx-auto max-w-7xl space-y-4 px-3 pb-8 pt-4 sm:space-y-6 sm:px-4 sm:pt-6 lg:px-8">
				{backendUnreachable && <BackendConnectionAlert />}
				<ClinicsTable clinics={clinicList} />
			</div>
		</>
	);
}
