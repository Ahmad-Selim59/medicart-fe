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

function ClinicRowLink({ href, className }: { href: string; className?: string }) {
	return (
		<Link
			href={href}
			className={cn(
				"inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground sm:py-1.5",
				className,
			)}
		>
			View clinic
			<ChevronRightIcon className="size-3.5" />
		</Link>
	);
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
		<section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:rounded-2xl">
			<div className="flex flex-col gap-4 border-b border-border p-4 pb-4 sm:p-6 sm:pb-5 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex items-center gap-3">
					<h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">All Clinics</h3>
					<span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
						{filteredClinics.length}
					</span>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
					<div className="relative w-full sm:min-w-[220px] sm:flex-1 lg:max-w-xs">
						<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search clinics..."
							className="w-full rounded-xl border border-input bg-muted/40 py-2.5 pr-4 pl-9 text-sm transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
						/>
					</div>

					<select
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value)}
						className="w-full cursor-pointer appearance-none rounded-xl border border-input bg-muted/40 py-2.5 pr-8 pl-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 sm:w-auto"
					>
						<option value="all">All Statuses</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</div>
			</div>

			{filteredClinics.length === 0 ? (
				<p className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
					No clinics match your search or filters.
				</p>
			) : (
				<>
					<div className="divide-y divide-border md:hidden">
						{filteredClinics.map((clinic) => {
							const href = `/clinic/${encodeURIComponent(clinic.id)}`;
							const websiteUrl = clinicWebsiteUrl(clinic.website);

							return (
								<article key={clinic.id} className="p-4">
									<div className="flex items-start gap-3">
										<div
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
												avatarClass(clinic.name),
											)}
										>
											{getInitials(clinic.name) || "?"}
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<Link
													href={href}
													className="truncate font-semibold text-primary transition-colors hover:text-accent hover:underline"
												>
													{clinic.name}
												</Link>
												<StatusBadge
													status={clinic.status === "active" ? "online" : "offline"}
													size="sm"
													bordered
												/>
											</div>
											{websiteUrl ? (
												<a
													href={websiteUrl}
													target="_blank"
													rel="noreferrer"
													className="mt-1 flex w-fit max-w-full items-center gap-1 truncate text-xs text-muted-foreground transition-colors hover:text-primary"
												>
													<span className="truncate">{clinic.website}</span>
													<ExternalLinkIcon className="size-3 shrink-0" />
												</a>
											) : null}
										</div>
									</div>

									<dl className="mt-3 space-y-2 text-xs">
										<div className="rounded-lg bg-muted/40 px-2.5 py-2">
											<dt className="text-muted-foreground">Location</dt>
											<dd className="mt-0.5 font-medium text-foreground">
												{clinic.address !== "Address N/A" ? clinic.address : "—"}
											</dd>
										</div>
										<div className="grid grid-cols-2 gap-2">
											<div className="rounded-lg bg-muted/40 px-2.5 py-2">
												<dt className="text-muted-foreground">Phone</dt>
												<dd className="mt-0.5 font-medium text-foreground">
													{clinic.phone !== "N/A" ? clinic.phone : "—"}
												</dd>
											</div>
											<div className="rounded-lg bg-muted/40 px-2.5 py-2">
												<dt className="text-muted-foreground">Patients</dt>
												<dd className="mt-0.5 font-medium tabular-nums text-foreground">{clinic.patientCount}</dd>
											</div>
										</div>
										{clinic.email !== "N/A" ? (
											<div className="rounded-lg bg-muted/40 px-2.5 py-2">
												<dt className="text-muted-foreground">Email</dt>
												<dd className="mt-0.5 truncate font-medium text-foreground">{clinic.email}</dd>
											</div>
										) : null}
									</dl>

									<ClinicRowLink href={href} className="mt-3 w-full" />
								</article>
							);
						})}
					</div>

					<div className="hidden overflow-x-auto md:block">
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
								{filteredClinics.map((clinic) => {
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
												<ClinicRowLink href={href} />
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
					Showing <span className="font-semibold text-foreground">{filteredClinics.length}</span> of{" "}
					<span className="font-semibold text-foreground">{clinics.length}</span> clinics
				</p>
			</div>
		</section>
	);
}
