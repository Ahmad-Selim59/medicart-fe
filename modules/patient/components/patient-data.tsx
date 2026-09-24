"use client";

import { Activity, Ruler, Scale, User } from "lucide-react";

import { StatusBadge } from "@/shared/components/custom/status-badge";
import { avatarClass, getInitials } from "@/shared/lib/avatar";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { Clinic, Patient } from "@/shared/types/api";

const stats = (patient: Patient, clinicName: string) => [
	{
		label: "Gender",
		value: patient.gender || "Unknown",
		icon: User,
	},
	{
		label: "Age",
		value: patient.age > 0 ? String(patient.age) : "—",
		icon: User,
	},
	{
		label: "Weight",
		value: patient.weight && patient.weight > 0 ? `${patient.weight} kg` : "—",
		icon: Scale,
	},
	{
		label: "Height",
		value: patient.height && patient.height > 0 ? `${patient.height} cm` : "—",
		icon: Ruler,
	},
	{
		label: "Clinic",
		value: clinicName,
		icon: Activity,
		className: "sm:col-span-2 lg:col-span-4",
	},
];

export function PatientData({ patient, clinics }: { patient: Patient; clinics: Clinic[] }) {
	const clinicName = clinics.find((c) => c.id === patient.clinicId)?.name ?? "Unknown";

	return (
		<Card className="overflow-hidden">
			<CardHeader className="px-4 pb-3 sm:px-6">
				<CardTitle className="text-base sm:text-lg">Patient Information</CardTitle>
			</CardHeader>
			<CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
				<div className="flex flex-col gap-5 sm:gap-6">
					<div className="flex items-start gap-3 sm:gap-4">
						<div
							className={cn(
								"flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold sm:size-14 sm:text-base",
								avatarClass(patient.name),
							)}
						>
							{getInitials(patient.name) || "?"}
						</div>
						<div className="min-w-0 flex-1 space-y-2">
							<p className="truncate text-lg font-semibold sm:text-xl">{patient.name}</p>
							<StatusBadge status={patient.status} bordered />
						</div>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{stats(patient, clinicName).map(({ label, value, icon: Icon, className }) => (
							<div
								key={label}
								className={cn(
									"rounded-xl border border-border bg-muted/30 px-3 py-2.5 sm:px-4 sm:py-3",
									className,
								)}
							>
								<div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
									<Icon className="size-3.5 shrink-0" />
									{label}
								</div>
								<p className="truncate text-sm font-semibold text-foreground sm:text-base">{value}</p>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default PatientData;
