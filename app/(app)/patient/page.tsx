import { PatientsTable } from "@/modules/patient/components/patients-table";
import { BackendConnectionAlert } from "@/shared/components/custom/backend-connection-alert";
import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { fetchBackend } from "@/shared/api/client";
import { createClient } from "@/shared/lib/supabase/server";
import type { Clinic, Patient } from "@/shared/types/api";

export const revalidate = 0;

export default async function PatientListPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	let allowedClinicsQuery = "";
	let token = "";

	if (user) {
		const { data: sessionData } = await supabase.auth.getSession();
		token = sessionData.session?.access_token || "";

		const { data: memberships } = await supabase
			.from("clinic_members")
			.select("clinics(name)")
			.eq("user_id", user.id);
		if (memberships && memberships.length > 0) {
			const names = memberships.map(m => (m.clinics as any)?.name).filter(Boolean);
			allowedClinicsQuery = `?clinics=${encodeURIComponent(names.join(","))}`;
		} else if (user) {
			allowedClinicsQuery = "?clinics=__none__";
		}
	}

	const fetchOpts = {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	};

	const { response: resPatients, unreachable: patientsUnreachable } = await fetchBackend(
		`/api/patients${allowedClinicsQuery}`,
		fetchOpts,
	);
	const patientList: Patient[] = resPatients?.ok ? ((await resPatients.json()) || []) : [];

	const { response: resClinics, unreachable: clinicsUnreachable } = await fetchBackend(
		`/api/clinics${allowedClinicsQuery}`,
		fetchOpts,
	);
	const clinics: Clinic[] = resClinics?.ok ? ((await resClinics.json()) || []) : [];
	const backendUnreachable = patientsUnreachable || clinicsUnreachable;

	return (
		<>
			<header className="sticky top-0 z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-background/80 backdrop-blur border-b">
				<SidebarTrigger className="-ml-1 shrink-0" />
				<Separator orientation="vertical" className="h-9/10 shrink-0" />
				<div className="flex-1 min-w-0">
					<h1 className="text-sm sm:text-base font-semibold leading-tight truncate">Patients</h1>
					<p className="hidden sm:block text-xs text-muted-foreground truncate">All enrolled patients across clinics</p>
				</div>
				<ThemeToggle />
			</header>

			<div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6 lg:px-8">
				{backendUnreachable && <BackendConnectionAlert />}
				<PatientsTable patients={patientList} clinics={clinics} />
			</div>
		</>
	);
}
