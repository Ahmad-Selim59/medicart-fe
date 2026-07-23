import { StatusBadge } from "@/shared/components/custom/status-badge";
import { buttonVariants } from "@/shared/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Patient, Clinic } from "@/shared/types/api";

import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

import { createClient } from "@/shared/lib/supabase/server";
import { API_BASE } from "@/shared/api/client";

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
			// If user is logged in but has 0 clinics, explicitly ask for 'none' 
			// to prevent the backend from defaulting to 'show everything'
			allowedClinicsQuery = "?clinics=__none__";
		}
	}

	const fetchOpts = {
		headers: {
			"Authorization": `Bearer ${token}`
		}
	};

	const resPatients = await fetch(`${API_BASE}/api/patients${allowedClinicsQuery}`, fetchOpts);
	const patientList: Patient[] = resPatients.ok ? ((await resPatients.json()) || []) : [];

	const resClinics = await fetch(`${API_BASE}/api/clinics${allowedClinicsQuery}`, fetchOpts);
	const clinics: Clinic[] = resClinics.ok ? ((await resClinics.json()) || []) : [];

	function getClinicName(clinicId: string) {
		return clinics.find(c => c.id === clinicId)?.name ?? clinicId;
	}

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

			<div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>
							All Patients (
							{patientList.length}
							)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Gender</TableHead>
									<TableHead>Age</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Clinic</TableHead>
									<TableHead>Heart Rate</TableHead>
									<TableHead>Blood Pressure</TableHead>
									<TableHead className="text-right">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{patientList.map((patient) => {
									const latestHr = patient.data?.heartRate?.at(-1);
									const latestBp = patient.data?.bloodPressure?.at(-1);
									return (
										<TableRow
											key={patient.id}
											className={patient.status === "critical" ? "border-l-4 border-l-red-400" : ""}
										>
											<TableCell className="font-medium">{patient.name}</TableCell>
											<TableCell>{patient.gender}</TableCell>
											<TableCell>{patient.age}</TableCell>
											<TableCell>
												<StatusBadge status={patient.status} size="sm" />
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">{getClinicName(patient.clinicId)}</TableCell>
											<TableCell className="text-sm tabular-nums">
												{latestHr?.pr ?? "--"}
												{" "}
												bpm
											</TableCell>
											<TableCell className="text-sm tabular-nums">
												{latestBp?.sys ?? "--"}
												/
												{latestBp?.dia ?? "--"}
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
					</CardContent>
				</Card>
			</div>
		</>
	);
}
