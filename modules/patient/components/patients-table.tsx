"use client";

import { StatusBadge } from "@/shared/components/custom/status-badge";
import { avatarClass, getInitials } from "@/shared/lib/avatar";
import { cn } from "@/shared/lib/utils";
import type { Clinic, Patient } from "@/shared/types/api";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface PatientsTableProps {
	patients: Patient[];
	clinics: Clinic[];
}

function PatientRowLink({
	href,
	label,
	className,
}: {
	href: string;
	label: string;
	className?: string;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground sm:py-1.5",
				className,
			)}
		>
			{label}
			<ChevronRightIcon className="size-3.5" />
		</Link>
	);
}

export function PatientsTable({ patients, clinics }: PatientsTableProps) {
	const [query, setQuery] = useState("");
	const [clinicFilter, setClinicFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");

	const clinicNameById = useMemo(
		() => Object.fromEntries(clinics.map((clinic) => [clinic.id, clinic.name])),
		[clinics],
	);

	const filteredPatients = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return patients.filter((patient) => {
			const clinicName = clinicNameById[patient.clinicId] ?? patient.clinicId;

			if (clinicFilter !== "all" && patient.clinicId !== clinicFilter) {
				return false;
			}

			if (statusFilter !== "all" && patient.status !== statusFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return (
				patient.name.toLowerCase().includes(normalizedQuery)
				|| patient.id.toLowerCase().includes(normalizedQuery)
				|| clinicName.toLowerCase().includes(normalizedQuery)
			);
		});
	}, [patients, clinicNameById, query, clinicFilter, statusFilter]);

	const emptyState = (
		<p className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
			No patients match your search or filters.
		</p>
	);

	return (
		<section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:rounded-2xl">
			<div className="flex flex-col gap-4 border-b border-border p-4 pb-4 sm:p-6 sm:pb-5 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex items-center gap-3">
					<h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">All Patients</h3>
					<span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
						{filteredPatients.length}
					</span>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
					<div className="relative w-full sm:min-w-[220px] sm:flex-1 lg:max-w-xs">
						<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search patients..."
							className="w-full rounded-xl border border-input bg-muted/40 py-2.5 pr-4 pl-9 text-sm transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
						/>
					</div>

					<select
						value={clinicFilter}
						onChange={(event) => setClinicFilter(event.target.value)}
						className="w-full cursor-pointer appearance-none rounded-xl border border-input bg-muted/40 py-2.5 pr-8 pl-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 sm:w-auto"
					>
						<option value="all">All Clinics</option>
						{clinics.map((clinic) => (
							<option key={clinic.id} value={clinic.id}>
								{clinic.name}
							</option>
						))}
					</select>

					<select
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value)}
						className="w-full cursor-pointer appearance-none rounded-xl border border-input bg-muted/40 py-2.5 pr-8 pl-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 sm:w-auto"
					>
						<option value="all">All Statuses</option>
						<option value="stable">Stable</option>
						<option value="warning">Review Needed</option>
						<option value="critical">Critical</option>
					</select>
				</div>
			</div>

			{filteredPatients.length === 0 ? (
				emptyState
			) : (
				<>
					<div className="divide-y divide-border md:hidden">
						{filteredPatients.map((patient) => {
							const latestHr = patient.data?.heartRate?.at(-1);
							const latestBp = patient.data?.bloodPressure?.at(-1);
							const clinicName = clinicNameById[patient.clinicId] ?? patient.clinicId;
							const href = `/patient/${encodeURIComponent(patient.id)}`;

							return (
								<article
									key={patient.id}
									className={cn(
										"p-4",
										patient.status === "critical" && "border-l-4 border-l-destructive",
									)}
								>
									<div className="flex items-start gap-3">
										<div
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
												avatarClass(patient.name),
											)}
										>
											{getInitials(patient.name) || "?"}
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<Link
													href={href}
													className="truncate font-semibold text-primary transition-colors hover:text-accent hover:underline"
												>
													{patient.name}
												</Link>
												<StatusBadge status={patient.status} size="sm" bordered />
											</div>
											<p className="mt-1 truncate text-xs text-muted-foreground">{clinicName}</p>
										</div>
									</div>

									<dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
										<div className="rounded-lg bg-muted/40 px-2.5 py-2">
											<dt className="text-muted-foreground">Gender</dt>
											<dd className="mt-0.5 font-medium text-foreground">{patient.gender || "—"}</dd>
										</div>
										<div className="rounded-lg bg-muted/40 px-2.5 py-2">
											<dt className="text-muted-foreground">Age</dt>
											<dd className="mt-0.5 font-medium text-foreground">{patient.age || "—"}</dd>
										</div>
										<div className="rounded-lg bg-muted/40 px-2.5 py-2">
											<dt className="text-muted-foreground">Heart Rate</dt>
											<dd className="mt-0.5 font-medium tabular-nums text-foreground">
												{latestHr?.pr ?? "—"} bpm
											</dd>
										</div>
										<div className="rounded-lg bg-muted/40 px-2.5 py-2">
											<dt className="text-muted-foreground">Blood Pressure</dt>
											<dd className="mt-0.5 font-medium tabular-nums text-foreground">
												{latestBp?.sys ?? "—"}/{latestBp?.dia ?? "—"}
											</dd>
										</div>
									</dl>

									<PatientRowLink href={href} label="View record" className="mt-3 w-full" />
								</article>
							);
						})}
					</div>

					<div className="hidden overflow-x-auto md:block">
						<table className="w-full border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-[12px] font-semibold tracking-wider text-muted-foreground">
									<th scope="col" className="px-6 py-3.5 font-semibold">Name</th>
									<th scope="col" className="px-4 py-3.5 font-semibold">Gender</th>
									<th scope="col" className="px-4 py-3.5 font-semibold">Age</th>
									<th scope="col" className="px-4 py-3.5 font-semibold">Status</th>
									<th scope="col" className="px-4 py-3.5 font-semibold">Clinic</th>
									<th scope="col" className="px-4 py-3.5 font-semibold">Heart Rate</th>
									<th scope="col" className="px-4 py-3.5 font-semibold">Blood Pressure</th>
									<th scope="col" className="px-6 py-3.5 text-right font-semibold">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border text-sm">
								{filteredPatients.map((patient) => {
									const latestHr = patient.data?.heartRate?.at(-1);
									const latestBp = patient.data?.bloodPressure?.at(-1);
									const clinicName = clinicNameById[patient.clinicId] ?? patient.clinicId;
									const href = `/patient/${encodeURIComponent(patient.id)}`;

									return (
										<tr
											key={patient.id}
											className={cn(
												"group cursor-pointer transition-colors hover:bg-muted/40",
												patient.status === "critical" && "border-l-4 border-l-destructive",
											)}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-3">
													<div
														className={cn(
															"flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
															avatarClass(patient.name),
														)}
													>
														{getInitials(patient.name) || "?"}
													</div>
													<div>
														<Link
															href={href}
															className="inline-block font-semibold text-primary transition-colors hover:text-accent hover:underline"
														>
															{patient.name}
														</Link>
													</div>
												</div>
											</td>
											<td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{patient.gender}</td>
											<td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{patient.age || "--"}</td>
											<td className="px-4 py-4 whitespace-nowrap">
												<StatusBadge status={patient.status} size="sm" bordered />
											</td>
											<td className="max-w-[180px] truncate px-4 py-4 font-medium text-foreground">{clinicName}</td>
											<td className="px-4 py-4 font-medium whitespace-nowrap tabular-nums text-muted-foreground">
												{latestHr?.pr ?? "--"} bpm
											</td>
											<td className="px-4 py-4 font-medium whitespace-nowrap tabular-nums text-muted-foreground">
												{latestBp?.sys ?? "--"}/{latestBp?.dia ?? "--"}
											</td>
											<td className="px-6 py-4 text-right whitespace-nowrap">
												<PatientRowLink href={href} label="View record" />
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</>
			)}

			<div className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-6 sm:py-4">
				<p>
					Showing <span className="font-semibold text-foreground">{filteredPatients.length}</span> of{" "}
					<span className="font-semibold text-foreground">{patients.length}</span> patients
				</p>
			</div>
		</section>
	);
}
