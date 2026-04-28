import { PatientData } from "@/modules/patient/components/patient-data";
import { CameraView } from "@/modules/patient/components/camera-view";
import SensorData from "@/modules/patient/components/sensor-data";
import { Patient, Clinic } from "@/shared/types/api";

import { Download } from "lucide-react";
import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

import { createClient } from "@/shared/lib/supabase/server";

export const revalidate = 0;

export default async function PatientPage({
	params,
}: {
	params: Promise<{ patientId: string }>;
}) {
	const { patientId } = await params;
	
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
			const names = memberships.map(m => (m.clinics as any).name);
			allowedClinicsQuery = `?clinics=${encodeURIComponent(names.join(","))}`;
		}
	}

	const fetchOpts = {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	};

	const resPatient = await fetch(`http://localhost:8081/api/patient/${patientId}${allowedClinicsQuery}`, fetchOpts);
	if (!resPatient.ok) {
		return <div className="p-8 text-center">Patient not found</div>;
	}
	const patient: Patient = await resPatient.json();

	const resClinics = await fetch(`http://localhost:8081/api/clinics${allowedClinicsQuery}`, fetchOpts);
	const clinics: Clinic[] = resClinics.ok ? await resClinics.json() : [];

	return (
		<>
			<header className="sticky top-0 z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-background/80 backdrop-blur border-b">
				<SidebarTrigger className="-ml-1 shrink-0" />
				<Separator orientation="vertical" className="h-9/10 shrink-0" />
				<div className="flex-1 min-w-0">
					<h1 className="text-sm sm:text-base font-semibold leading-tight truncate">
						{patient.name}
					</h1>
					<p className="hidden sm:block text-xs text-muted-foreground truncate">Vitals, history, and live monitoring</p>
				</div>
				<ThemeToggle />
				<Button size="sm" className="shrink-0">
					<Download className="size-4" />
					<span className="hidden sm:inline">Export</span>
				</Button>
			</header>

			<div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
				<PatientData patient={patient} clinics={clinics} />
				<SensorData patient={patient} />
				<CameraView patient={patient} />
			</div>
		</>
	);
}
