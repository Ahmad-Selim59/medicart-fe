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
	let isClinicAdmin = false;

	if (user) {
		const { data: sessionData } = await supabase.auth.getSession();
		token = sessionData.session?.access_token || "";

		const { data: memberships } = await supabase
			.from("clinic_members")
			.select("role, clinics(name)")
			.eq("user_id", user.id);
		
		if (memberships && memberships.length > 0) {
			const names = memberships.map(m => (m.clinics as any).name);
			allowedClinicsQuery = `?clinics=${encodeURIComponent(names.join(","))}`;
			
			// Check if admin for THIS clinic
			// We need to fetch the clinic name first to compare, or use ID if available
			// Let's just check if they have ANY admin role in the memberships for now
			// or better, fetch the membership for this specific clinic ID later.
		}
	}

	const fetchOpts = {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	};

	const resClinic = await fetch(`http://localhost:8081/api/clinic/${clinicId}${allowedClinicsQuery}`, fetchOpts);
	if (!resClinic.ok) {
		return <div className="p-8 text-center">Clinic not found</div>;
	}
	const clinic: Clinic = await resClinic.json();

	// Verify if admin for this specific clinic
	if (user) {
		const { data: member } = await supabase
			.from("clinic_members")
			.select("role")
			.eq("user_id", user.id)
			.eq("clinic_id", clinic.id)
			.single();
		
		if (member?.role === "admin") {
			isClinicAdmin = true;
		}
	}

	const resPatients = await fetch(`http://localhost:8081/api/clinic/${clinicId}/patients${allowedClinicsQuery}`, fetchOpts);
	const patients: Patient[] = resPatients.ok ? await resPatients.json() : [];

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
				{isClinicAdmin && <InviteDoctorButton clinicId={clinic.id} />}
				<Button size="sm" variant="ghost" className="shrink-0">
					<Download className="size-4" />
					<span className="hidden sm:inline">Export</span>
				</Button>
			</header>

			<div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<ClinicDetails clinic={clinic} patients={patients} />

					<div className="lg:col-span-2">
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
					</div>
				</div>
			</div>
		</>
	);
}
