"use client";
import { Activity, Clock, Droplets, HeartPulse, Thermometer, User, Wind } from "lucide-react";

import { StatusBadge } from "@/shared/components/custom/status-badge";
import { VitalSignCard } from "@/shared/components/custom/vital-sign-card";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
function getVitalStatus(value: number, min: number, max: number): "normal" | "warning" | "critical" {
	if (value < min * 0.85 || value > max * 1.15)
		return "critical";
	if (value < min || value > max)
		return "warning";
	return "normal";
}

import { Patient, Clinic } from "@/shared/types/api";

export function PatientData({ patient, clinics }: { patient: Patient, clinics: Clinic[] }) {
	const clinicName = clinics.find(c => c.id === patient.clinicId)?.name ?? "Unknown";
	const initials = patient.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

	const latestHr = patient.data?.heartRate?.at(-1);
	const latestBp = patient.data?.bloodPressure?.at(-1);
	const latestGlu = patient.data?.glucose?.at(-1);
	const latestTemp = patient.data?.temperature?.at(-1);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Patient Info Card */}
			<Card>
				<CardHeader>
					<CardTitle>Patient Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-3">
						<Avatar size="lg">
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-semibold text-lg">{patient.name}</p>
							<StatusBadge status={patient.status} />
						</div>
					</div>
					<div className="space-y-3 pt-2">
						<div className="flex items-center gap-2 text-sm">
							<User className="size-4 text-muted-foreground" />
							<span className="text-muted-foreground">Gender:</span>
							<span className="font-medium">{patient.gender}</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<User className="size-4 text-muted-foreground" />
							<span className="text-muted-foreground">Age:</span>
							<span className="font-medium">{patient.age}</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Activity className="size-4 text-muted-foreground" />
							<span className="text-muted-foreground">Clinic:</span>
							<span className="font-medium">{clinicName}</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Clock className="size-4 text-muted-foreground" />
							<span className="text-muted-foreground">Last checked:</span>
							<span className="font-medium">{patient.lastChecked ? new Date(patient.lastChecked).toLocaleTimeString() : "Never"}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Vital Signs Summary */}
			<div className="lg:col-span-2">
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
					<VitalSignCard
						title="Heart Rate"
						value={latestHr?.pr ?? 0}
						unit="bpm"
						icon={<HeartPulse className="size-4" />}
						data={patient.data?.heartRate?.map(d => ({ value: d.pr })) ?? []}
						status={getVitalStatus(latestHr?.pr ?? 72, 60, 100)}
					/>
					<VitalSignCard
						title="SpO2"
						value={latestHr?.spo2 ?? 0}
						unit="%"
						icon={<Wind className="size-4" />}
						data={patient.data?.heartRate?.map(d => ({ value: d.spo2 })) ?? []}
						status={getVitalStatus(latestHr?.spo2 ?? 98, 95, 100)}
					/>
					<VitalSignCard
						title="Blood Pressure"
						value={`${latestBp?.sys ?? 0}/${latestBp?.dia ?? 0}`}
						unit="mmHg"
						icon={<Activity className="size-4" />}
						data={patient.data?.bloodPressure?.map(d => ({ value: d.sys })) ?? []}
						status={getVitalStatus(latestBp?.sys ?? 120, 90, 140)}
					/>
					<VitalSignCard
						title="Temperature"
						value={latestTemp?.temp ?? 0}
						unit="°C"
						icon={<Thermometer className="size-4" />}
						data={patient.data?.temperature?.map(d => ({ value: d.temp })) ?? []}
						status={getVitalStatus(latestTemp?.temp ?? 36.6, 36.1, 37.2)}
					/>
					<VitalSignCard
						title="Glucose"
						value={latestGlu?.glu ?? 0}
						unit="mg/dL"
						icon={<Droplets className="size-4" />}
						data={patient.data?.glucose?.map(d => ({ value: d.glu })) ?? []}
						status={getVitalStatus(latestGlu?.glu ?? 95, 70, 140)}
					/>
				</div>
			</div>
		</div>
	);
}
export default PatientData;
