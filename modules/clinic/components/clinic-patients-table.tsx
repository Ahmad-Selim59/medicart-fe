"use client";

import { StatusBadge } from "@/shared/components/custom/status-badge";
import { avatarClass, getInitials } from "@/shared/lib/avatar";
import { cn } from "@/shared/lib/utils";
import type { Patient } from "@/shared/types/api";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface ClinicPatientsTableProps {
	patients: Patient[];
}

export function ClinicPatientsTable({ patients }: ClinicPatientsTableProps) {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const filteredPatients = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return patients.filter((patient) => {
			if (statusFilter !== "all" && patient.status !== statusFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return (
				patient.name.toLowerCase().includes(normalizedQuery)
				|| patient.id.toLowerCase().includes(normalizedQuery)
			);
		});
	}, [patients, query, statusFilter]);

	return (
		<section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
			<div className="flex flex-col justify-between gap-4 border-b border-border p-6 pb-5 md:flex-row md:items-center">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-bold tracking-tight text-foreground">Enrolled Patients</h3>
					<span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
						{filteredPatients.length}
					</span>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="relative min-w-[220px] lg:min-w-[260px]">
						<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search patients..."
							className="w-full rounded-xl border border-input bg-muted/40 py-2 pr-4 pl-9 text-sm transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
						/>
					</div>

					<select
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value)}
						className="cursor-pointer appearance-none rounded-xl border border-input bg-muted/40 py-2 pr-8 pl-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
					>
						<option value="all">All Statuses</option>
						<option value="stable">Stable</option>
						<option value="warning">Review Needed</option>
						<option value="critical">Critical</option>
					</select>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left">
					<thead>
						<tr className="border-b border-border text-[12px] font-semibold tracking-wider text-muted-foreground">
							<th scope="col" className="px-6 py-3.5 font-semibold">Name</th>
							<th scope="col" className="px-4 py-3.5 font-semibold">Gender</th>
							<th scope="col" className="px-4 py-3.5 font-semibold">Age</th>
							<th scope="col" className="px-4 py-3.5 font-semibold">Status</th>
							<th scope="col" className="px-6 py-3.5 text-right font-semibold">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border text-sm">
						{filteredPatients.length === 0 ? (
							<tr>
								<td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
									No patients match your search or filters.
								</td>
							</tr>
						) : (
							filteredPatients.map((patient) => {
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
												<Link
													href={href}
													className="font-semibold text-primary transition-colors hover:text-accent hover:underline"
												>
													{patient.name}
												</Link>
											</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{patient.gender}</td>
										<td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{patient.age || "--"}</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<StatusBadge status={patient.status} size="sm" bordered />
										</td>
										<td className="px-6 py-4 text-right whitespace-nowrap">
											<Link
												href={href}
												className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
											>
												View record
												<ChevronRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
											</Link>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-between border-t border-border px-6 py-4 text-xs text-muted-foreground">
				<p>
					Showing <span className="font-semibold text-foreground">{filteredPatients.length}</span> of{" "}
					<span className="font-semibold text-foreground">{patients.length}</span> patients
				</p>
			</div>
		</section>
	);
}
