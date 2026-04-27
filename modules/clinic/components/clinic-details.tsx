import { Building2, Globe, Mail, MapPin, Phone, Users } from "lucide-react";

import { StatusBadge } from "@/shared/components/custom/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Clinic, Patient } from "@/shared/types/api";

export function ClinicDetails({ clinic, patients }: { clinic: Clinic; patients: Patient[] }) {

	const details = [
		{ icon: Building2, label: "Name", value: clinic?.name },
		{ icon: MapPin, label: "Address", value: clinic?.address },
		{ icon: Phone, label: "Phone", value: clinic?.phone },
		{ icon: Mail, label: "Email", value: clinic?.email },
		{ icon: Globe, label: "Website", value: clinic?.website },
		{ icon: Users, label: "Total Patients", value: patients.length },
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Clinic Information</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{details.map(({ icon: Icon, label, value }) => (
					<div key={label} className="flex items-start gap-3">
						<Icon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
						<div className="flex-1 min-w-0">
							<p className="text-xs text-muted-foreground">{label}</p>
							<p className="text-sm font-medium break-words">{value}</p>
						</div>
					</div>
				))}
				<div className="flex items-start gap-3 pt-1">
					<div className="size-4 shrink-0" />
					<div>
						<p className="text-xs text-muted-foreground mb-1">Status</p>
						<StatusBadge status={clinic?.status === "active" ? "online" : "offline"} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
