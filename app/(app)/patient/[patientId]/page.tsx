import { PatientData } from "@/modules/patient/components/patient-data";
import { EcgReadings } from "@/modules/patient/components/ecg-readings";
import SensorData from "@/modules/patient/components/sensor-data";
import { Patient, Clinic } from "@/shared/types/api";

import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

import { BackendConnectionAlert } from "@/shared/components/custom/backend-connection-alert";
import { fetchBackend } from "@/shared/api/client";
import { backendAuthHeaders, getAppSession } from "@/shared/lib/auth/app-session";

export const revalidate = 0;

export default async function PatientPage({
	params,
}: {
	params: Promise<{ patientId: string }>;
}) {
	const { patientId } = await params;
	const session = await getAppSession();
	if (!session) {
		return null;
	}

	const fetchOpts = { headers: backendAuthHeaders(session.token) };

	const [{ response: resPatient, unreachable: patientUnreachable }, { response: resClinics, unreachable: clinicsUnreachable }] =
		await Promise.all([
			fetchBackend(`/api/patient/${patientId}${session.allowedClinicsQuery}`, fetchOpts),
			fetchBackend(`/api/clinics${session.allowedClinicsQuery}`, fetchOpts),
		]);

	if (patientUnreachable) {
		return (
			<div className="max-w-3xl mx-auto px-4 py-8">
				<BackendConnectionAlert />
			</div>
		);
	}

	if (!resPatient?.ok) {
		return <div className="p-8 text-center">Patient not found</div>;
	}

	const patient: Patient = await resPatient.json();
	const clinics: Clinic[] = resClinics?.ok ? await resClinics.json() : [];
	const backendUnreachable = clinicsUnreachable;

	return (
		<>
			<header className="sticky top-0 z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-background/80 backdrop-blur border-b">
				<SidebarTrigger className="-ml-1 shrink-0" />
				<Separator orientation="vertical" className="h-9/10 shrink-0" />
				<div className="flex-1 min-w-0">
					<h1 className="text-sm sm:text-base font-semibold leading-tight truncate">
						{patient.name}
					</h1>
					<p className="hidden sm:block text-xs text-muted-foreground truncate">Vitals and health history</p>
				</div>
				<ThemeToggle />
			</header>

			<div className="mx-auto max-w-7xl space-y-4 px-3 pb-8 pt-4 sm:space-y-6 sm:px-4 sm:pt-6">
				{backendUnreachable && <BackendConnectionAlert />}
				<PatientData patient={patient} clinics={clinics} />
				<SensorData patient={patient} />
				<EcgReadings patient={patient} />
			</div>
		</>
	);
}
