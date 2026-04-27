import { StatusBadge } from "@/shared/components/custom/status-badge";
import { buttonVariants } from "@/shared/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";
import { ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import { Clinic } from "@/shared/types/api";

import { Plus } from "lucide-react";
import { ThemeToggle } from "@/shared/components/custom/theme-toggle";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

export const revalidate = 0;

export default async function ClinicListPage() {
	const res = await fetch("http://localhost:8081/api/clinics");
	const clinicList: Clinic[] = await res.json();

	return (
		<>
			<header className="sticky top-0 z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-background/80 backdrop-blur border-b">
				<SidebarTrigger className="-ml-1 shrink-0" />
				<Separator orientation="vertical" className="h-9/10 shrink-0" />
				<div className="flex-1 min-w-0">
					<h1 className="text-sm sm:text-base font-semibold leading-tight truncate">Clinics</h1>
					<p className="hidden sm:block text-xs text-muted-foreground truncate">Connected facilities</p>
				</div>
				<ThemeToggle />
				<Button size="sm" className="shrink-0">
					<Plus className="size-4" />
					<span className="hidden sm:inline">Add Clinic</span>
				</Button>
			</header>

			<div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>
							All Clinics (
							{clinicList.length}
							)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Clinic Name</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Patients</TableHead>
									<TableHead className="text-right">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{clinicList.map(clinic => (
									<TableRow key={clinic.id}>
										<TableCell className="font-medium">
											<div className="flex flex-col gap-1">
												<span>{clinic.name}</span>
												<a
													href={`https://${clinic.website}`}
													target="_blank"
													rel="noreferrer"
													className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 w-fit"
												>
													{clinic.website}
													<ExternalLink className="size-3" />
												</a>
											</div>
										</TableCell>
										<TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
											{clinic.address}
										</TableCell>
										<TableCell className="text-sm">
											<div className="flex flex-col gap-1">
												<span>{clinic.phone}</span>
												<span className="text-muted-foreground text-xs">{clinic.email}</span>
											</div>
										</TableCell>
										<TableCell>
											<StatusBadge status={clinic.status === "active" ? "online" : "offline"} size="sm" />
										</TableCell>
										<TableCell className="text-right tabular-nums">{clinic.patientCount}</TableCell>
										<TableCell className="text-right">
											<Link
												className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
												href={`/clinic/${clinic.id}`}
											>
												<Eye className="size-4" />
											</Link>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
