"use client";

import { StatusBadge } from "@/shared/components/custom/status-badge";
import { avatarClass, getInitials } from "@/shared/lib/avatar";
import { cn } from "@/shared/lib/utils";
import type { Clinic } from "@/shared/types/api";
import { ChevronRightIcon, ExternalLinkIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface ClinicsTableProps {
	clinics: Clinic[];
}

function clinicWebsiteUrl(website: string) {
	if (!website || website === "N/A") {
		return null;
	}
	return website.startsWith("http") ? website : `https://${website}`;
}

export function ClinicsTable({ clinics }: ClinicsTableProps) {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const filteredClinics = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return clinics.filter((clinic) => {
			if (statusFilter !== "all" && clinic.status !== statusFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return (
				clinic.name.toLowerCase().includes(normalizedQuery)
				|| clinic.address.toLowerCase().includes(normalizedQuery)
				|| clinic.email.toLowerCase().includes(normalizedQuery)
				|| clinic.phone.toLowerCase().includes(normalizedQuery)
			);
		});
	}, [clinics, query, statusFilter]);

	return (
		<section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
			<div className="flex flex-col justify-between gap-4 border-b border-border p-6 pb-5 md:flex-row md:items-center">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-bold tracking-tight text-foreground">All Clinics</h3>
					<span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
						{filteredClinics.length}
					</span>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="relative min-w-[240px] lg:min-w-[280px]">
						<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search clinics by name or location..."
							className="w-full rounded-xl border border-input bg-muted/40 py-2 pr-4 pl-9 text-sm transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
						/>
					</div>

					<select
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value)}
						className="cursor-pointer appearance-none rounded-xl border border-input bg-muted/40 py-2 pr-8 pl-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
					>
						<option value="all">All Statuses</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left">
					<thead>
						<tr className="border-b border-border text-[12px] font-semibold tracking-wider text-muted-foreground">
							<th scope="col" className="px-6 py-3.5 font-semibold">Clinic Name</th>
							<th scope="col" className="px-4 py-3.5 font-semibold">Location</th>
							<th scope="col" className="px-4 py-3.5 font-semibold">Contact</th>
							<th scope="col" className="px-4 py-3.5 font-semibold">Status</th>
							<th scope="col" className="px-4 py-3.5 text-right font-semibold">Patients</th>
							<th scope="col" className="px-6 py-3.5 text-right font-semibold">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border text-sm">
						{filteredClinics.length === 0 ? (
							<tr>
								<td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
									No clinics match your search or filters.
								</td>
							</tr>
						) : (
							filteredClinics.map((clinic) => {
								const href = `/clinic/${encodeURIComponent(clinic.id)}`;
								const websiteUrl = clinicWebsiteUrl(clinic.website);

								return (
									<tr
										key={clinic.id}
										className="group cursor-pointer transition-colors hover:bg-muted/40"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-3">
												<div
													className={cn(
														"flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
														avatarClass(clinic.name),
													)}
												>
													{getInitials(clinic.name) || "?"}
												</div>
												<div>
													<Link
														href={href}
														className="inline-block font-semibold text-primary transition-colors hover:text-accent hover:underline"
													>
														{clinic.name}
													</Link>
													{websiteUrl ? (
														<a
															href={websiteUrl}
															target="_blank"
															rel="noreferrer"
															onClick={(event) => event.stopPropagation()}
															className="mt-0.5 flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
														>
															{clinic.website}
															<ExternalLinkIcon className="size-3" />
														</a>
													) : null}
												</div>
											</div>
										</td>
										<td className="max-w-[220px] truncate px-4 py-4 text-muted-foreground">
											{clinic.address !== "Address N/A" ? clinic.address : "--"}
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<div className="flex flex-col gap-0.5">
												<span className="text-foreground">{clinic.phone !== "N/A" ? clinic.phone : "--"}</span>
												<span className="text-xs text-muted-foreground">
													{clinic.email !== "N/A" ? clinic.email : "--"}
												</span>
											</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<StatusBadge
												status={clinic.status === "active" ? "online" : "offline"}
												size="sm"
												bordered
											/>
										</td>
										<td className="px-4 py-4 text-right font-medium tabular-nums text-foreground">
											{clinic.patientCount}
										</td>
										<td className="px-6 py-4 text-right whitespace-nowrap">
											<Link
												href={href}
												className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
											>
												View clinic
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
					Showing <span className="font-semibold text-foreground">{filteredClinics.length}</span> of{" "}
					<span className="font-semibold text-foreground">{clinics.length}</span> clinics
				</p>
			</div>
		</section>
	);
}
