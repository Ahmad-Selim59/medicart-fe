import { ClinicDetails } from "@/modules/clinic/components/clinic-details";
import { Clinic, Patient } from "@/shared/types/api";
import { buttonVariants } from "@/shared/components/ui/button-variants";
import { StatusBadge } from "@/shared/components/custom/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";
import { Download, Eye } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

import { createClient } from "@/shared/lib/supabase/server";
import { InviteDoctorButton } from "../invite-doctor-button";
import { API_BASE } from "@/shared/api/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { RemoveDoctorButton } from "../remove-doctor-button";

export const revalidate = 0;

export default async function ClinicDetailPage({
	params,
}: {
	params: Promise<{ clinicId: string }>;
}) {
	const { clinicId } = await params;
	
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	let allowedClinicsQuery = "";
	let token = "";
	if (user) {
		const { data: sessionData } = await supabase.auth.getSession();
		token = sessionData.session?.access_token || "";

		const { data: memberships } = await supabase
			.from("clinic_members")
			.select("role, clinics(name)")
			.eq("user_id", user.id);
		
		if (memberships && memberships.length > 0) {
			const names = memberships.map(m => (m.clinics as any)?.name).filter(Boolean);
			allowedClinicsQuery = `?clinics=${encodeURIComponent(names.join(","))}`;
		}
	}

	const fetchOpts = {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	};

	let clinic: Clinic = { id: "", name: clinicId, address: "", phone: "", email: "", website: "", status: "active", patientCount: 0, action: "" };
	let patients: Patient[] = [];
	let doctors: any[] = [];
	let isClinicAdmin = false;
	let realClinicId = "";

	try {
		const resClinic = await fetch(`${API_BASE}/api/clinic/${clinicId}${allowedClinicsQuery}`, {
			...fetchOpts,
			cache: 'no-store'
		});
		
		if (!resClinic.ok) {
			return <div className="p-8 text-center text-muted-foreground">Clinic not found or access denied.</div>;
		}
		clinic = await resClinic.json();

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

		const resPatients = await fetch(`${API_BASE}/api/clinic/${clinicId}/patients${allowedClinicsQuery}`, fetchOpts);
		patients = resPatients.ok ? ((await resPatients.json()) || []) : [];
	} catch (err) {
		return <div className="p-8 text-center text-muted-foreground">Unable to load clinic details. Please try again later.</div>;
	}

	return (
		<>
			<header className="sticky top-0 z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-background/80 backdrop-blur border-b">
				<SidebarTrigger className="-ml-1 shrink-0" />
				<Separator orientation="vertical" className="h-9/10 shrink-0" />
				<div className="flex-1 min-w-0">
					<h1 className="text-sm sm:text-base font-semibold leading-tight truncate">{clinic.name}</h1>
					<p className="hidden sm:block text-xs text-muted-foreground truncate">Facility info and enrolled patients</p>
				</div>
				<ThemeToggle />
				<Button size="sm" variant="ghost" className="shrink-0">
					<Download className="size-4" />
					<span className="hidden sm:inline">Export</span>
				</Button>
			</header>

			<div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<ClinicDetails clinic={clinic} patients={patients} />

					<div className="lg:col-span-2">
						<Tabs defaultValue="patients">
							<div className="flex items-center justify-between mb-4">
								<TabsList>
									<TabsTrigger value="patients">Patients</TabsTrigger>
									<TabsTrigger value="staff">Staff & Doctors</TabsTrigger>
								</TabsList>
								{isClinicAdmin && realClinicId && (
									<TabsContent value="staff" className="m-0">
										<InviteDoctorButton clinicId={realClinicId} />
									</TabsContent>
								)}
							</div>

							<TabsContent value="patients" className="mt-0">
								<Card>
									<CardHeader>
										<CardTitle>Enrolled Patients ({patients.length})</CardTitle>
									</CardHeader>
									<CardContent>
										{patients.length === 0
											? (
													<p className="text-muted-foreground text-sm">No patients found for this clinic.</p>
												)
											: (
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Name</TableHead>
																<TableHead>Gender</TableHead>
																<TableHead>Age</TableHead>
																<TableHead>Status</TableHead>
																<TableHead className="text-right">Action</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{patients.map((patient) => {
																return (
																	<TableRow key={patient.id}>
																		<TableCell className="font-medium">{patient.name}</TableCell>
																		<TableCell>{patient.gender}</TableCell>
																		<TableCell>{patient.age}</TableCell>
																		<TableCell>
																			<StatusBadge status={patient.status} size="sm" />
																		</TableCell>
																		<TableCell className="text-right">
																			<Link
																				className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
																				href={`/patient/${patient.id}`}
																			>
																				<Eye className="size-4" />
																			</Link>
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

							<TabsContent value="staff" className="mt-0">
								<Card>
									<CardHeader>
										<CardTitle>Clinical Staff ({doctors.length})</CardTitle>
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
						</Tabs>
					</div>
				</div>
			</div>
		</>
	);
}
