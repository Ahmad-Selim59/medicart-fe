"use client";
import { Activity, Ruler, Scale, User } from "lucide-react";

import { StatusBadge } from "@/shared/components/custom/status-badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Patient, Clinic } from "@/shared/types/api";

export function PatientData({ patient, clinics }: { patient: Patient, clinics: Clinic[] }) {
	const clinicName = clinics.find(c => c.id === patient.clinicId)?.name ?? "Unknown";
	const initials = patient.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Patient Information</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col sm:flex-row sm:items-start gap-6">
					<div className="flex items-center gap-3">
						<Avatar size="lg">
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-semibold text-lg">{patient.name}</p>
							<StatusBadge status={patient.status} />
						</div>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 flex-1">
						<div className="flex items-center gap-2 text-sm">
							<User className="size-4 text-muted-foreground shrink-0" />
							<span className="text-muted-foreground">Gender:</span>
							<span className="font-medium">{patient.gender || "Unknown"}</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<User className="size-4 text-muted-foreground shrink-0" />
							<span className="text-muted-foreground">Age:</span>
							<span className="font-medium">{patient.age > 0 ? patient.age : "—"}</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Scale className="size-4 text-muted-foreground shrink-0" />
							<span className="text-muted-foreground">Weight:</span>
							<span className="font-medium">{patient.weight && patient.weight > 0 ? `${patient.weight} kg` : "—"}</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Ruler className="size-4 text-muted-foreground shrink-0" />
							<span className="text-muted-foreground">Height:</span>
							<span className="font-medium">{patient.height && patient.height > 0 ? `${patient.height} cm` : "—"}</span>
						</div>
						<div className="flex items-center gap-2 text-sm sm:col-span-2">
							<Activity className="size-4 text-muted-foreground shrink-0" />
							<span className="text-muted-foreground">Clinic:</span>
							<span className="font-medium">{clinicName}</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default PatientData;
