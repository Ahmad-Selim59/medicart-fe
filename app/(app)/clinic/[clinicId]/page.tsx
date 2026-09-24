import { ClinicDetails } from "@/modules/clinic/components/clinic-details";
import { ClinicPatientsTable } from "@/modules/clinic/components/clinic-patients-table";
import { ClinicPageTabs } from "@/modules/clinic/components/clinic-page-tabs";
import { FacilityCameraView } from "@/modules/clinic/components/facility-camera-view";
import { BackendConnectionAlert } from "@/shared/components/custom/backend-connection-alert";
import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { TabsContent } from "@/shared/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { fetchBackend } from "@/shared/api/client";
import { backendAuthHeaders, getAppSession } from "@/shared/lib/auth/app-session";
import { createClient } from "@/shared/lib/supabase/server";
import { Clinic, Patient } from "@/shared/types/api";

import { InviteDoctorButton } from "../invite-doctor-button";
import { RemoveDoctorButton } from "../remove-doctor-button";

export const revalidate = 0;

export default async function ClinicDetailPage({
	params,
}: {
	params: Promise<{ clinicId: string }>;
}) {
	const { clinicId } = await params;

	const session = await getAppSession();
	if (!session) {
		return null;
	}

	const supabase = await createClient();
	const { user } = session;
	const fetchOpts = { headers: backendAuthHeaders(session.token) };

	let clinic: Clinic = { id: "", name: clinicId, address: "", phone: "", email: "", website: "", status: "active", patientCount: 0, action: "" };
	let patients: Patient[] = [];
	let doctors: any[] = [];
	let isClinicAdmin = false;
	let realClinicId = "";

	let backendUnreachable = false;

	try {
		const [{ response: resClinic, unreachable }, { response: resPatients, unreachable: patientsUnreachable }] =
			await Promise.all([
				fetchBackend(`/api/clinic/${clinicId}${session.allowedClinicsQuery}`, {
					...fetchOpts,
					cache: "no-store",
				}),
				fetchBackend(`/api/clinic/${clinicId}/patients${session.allowedClinicsQuery}`, fetchOpts),
			]);

		backendUnreachable = unreachable || patientsUnreachable;

		if (unreachable) {
			return (
				<div className="max-w-3xl mx-auto px-4 py-8">
					<BackendConnectionAlert />
				</div>
			);
		}

		if (!resClinic?.ok) {
			return <div className="p-8 text-center text-muted-foreground">Clinic not found or access denied.</div>;
		}
		clinic = await resClinic.json();
		patients = resPatients?.ok ? ((await resPatients.json()) || []) : [];

		if (user) {
			const { data: dbClinic } = await supabase
				.from("clinics")
				.select("id")
				.eq("name", clinic.name)
				.single();

			if (dbClinic) {
				realClinicId = dbClinic.id;
				const { data: members } = await supabase
					.from("clinic_members")
					.select("user_id, role, profiles(full_name, email)")
					.eq("clinic_id", dbClinic.id);

				if (members) {
					doctors = members;
					const myMember = doctors.find(m => m.user_id === user.id);
					if (myMember?.role === "admin") {
						isClinicAdmin = true;
					}
					doctors = doctors.filter(m => m.role === "doctor");
				}
			}
		}
	} catch (err) {
		return <div className="p-8 text-center text-muted-foreground">Unable to load clinic details. Please try again later.</div>;
	}

	let senderName = session.profile?.full_name || user.user_metadata?.full_name || "Doctor";

	return (
		<ClinicPageTabs
			leftHeader={(
				<>
					<SidebarTrigger className="-ml-2" />
					<Separator orientation="vertical" className="h-6" />
					<div className="flex flex-col">
						<h1 className="text-sm font-bold leading-none truncate">{clinic.name}</h1>
						<span className="text-[9px] text-muted-foreground uppercase tracking-widest font-extrabold mt-1">Facility Hub</span>
					</div>
				</>
			)}
			rightHeader={<ThemeToggle />}
		>
			<main className="mx-auto max-w-[1600px] space-y-6 p-3 animate-in fade-in duration-500 sm:space-y-8 sm:p-6 lg:p-8">
				{backendUnreachable && <BackendConnectionAlert />}
				<TabsContent value="camera" className="mt-0">
					<FacilityCameraView clinicName={clinic.name} senderName={senderName} />
				</TabsContent>


				<TabsContent value="patients" className="mt-0">
					<div className="grid grid-cols-1 gap-4 xl:grid-cols-4 xl:gap-6">
						<div className="xl:col-span-1">
							<ClinicDetails clinic={clinic} patients={patients} />
						</div>
						<div className="xl:col-span-3">
							<ClinicPatientsTable patients={patients} />
						</div>
					</div>
				</TabsContent>

				<TabsContent value="staff" className="mt-0">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Clinical Staff ({doctors.length})</CardTitle>
							{isClinicAdmin && realClinicId && (
								<InviteDoctorButton clinicId={realClinicId} />
							)}
						</CardHeader>
						<CardContent>
							{doctors.length === 0
								? (
										<p className="text-muted-foreground text-sm">No doctors have been added to this clinic yet.</p>
									)
								: (
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Name</TableHead>
													<TableHead>Email</TableHead>
													<TableHead className="text-right">Action</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{doctors.map((doctor) => {
													const profile = doctor.profiles as any;
													return (
														<TableRow key={doctor.user_id}>
															<TableCell className="font-medium">{profile?.full_name || "Unknown Doctor"}</TableCell>
															<TableCell>{profile?.email || "No email"}</TableCell>
															<TableCell className="text-right">
																{isClinicAdmin && (
																	<RemoveDoctorButton 
																		clinicId={realClinicId} 
																		userId={doctor.user_id} 
																		doctorName={profile?.full_name || "this doctor"} 
																	/>
																)}
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									)}
						</CardContent>
					</Card>
				</TabsContent>
			</main>
		</ClinicPageTabs>
	);
}
