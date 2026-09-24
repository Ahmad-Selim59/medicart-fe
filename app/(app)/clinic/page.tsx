import { ClinicsTable } from "@/modules/clinic/components/clinics-table";
import { BackendConnectionAlert } from "@/shared/components/custom/backend-connection-alert";
import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { fetchBackend } from "@/shared/api/client";
import { createClient } from "@/shared/lib/supabase/server";
import type { Clinic } from "@/shared/types/api";

import { AddClinicButton } from "./add-clinic-button";

export const revalidate = 0;

export default async function ClinicListPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	let allowedClinicNames: string[] = [];
	let isAdmin = false;
	let token = "";

	if (user) {
		const { data: sessionData } = await supabase.auth.getSession();
		token = sessionData.session?.access_token || "";

		const { data: memberships } = await supabase
			.from("clinic_members")
			.select("clinics(name)")
			.eq("user_id", user.id);

		if (memberships) {
			allowedClinicNames = memberships.map(m => (m.clinics as any).name);
		}

		const { data: profile } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.single();

		if (profile?.role === "admin" || user.user_metadata?.role === "admin") {
			isAdmin = true;
		}
	}

	const { response: res, unreachable: backendUnreachable } = await fetchBackend("/api/clinics", {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	});
	let clinicList: Clinic[] = res?.ok ? ((await res.json()) || []) : [];

	if (user) {
		clinicList = clinicList.filter(c => allowedClinicNames.includes(c.name));
	}

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
				{isAdmin && <AddClinicButton />}
			</header>

			<div className="mx-auto max-w-7xl space-y-4 px-3 pb-8 pt-4 sm:space-y-6 sm:px-4 sm:pt-6 lg:px-8">
				{backendUnreachable && <BackendConnectionAlert />}
				<ClinicsTable clinics={clinicList} />
			</div>
		</>
	);
}
