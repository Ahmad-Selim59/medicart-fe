"use client";

import { useState, ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

interface ClinicPageTabsProps {
	children: ReactNode;
	leftHeader: ReactNode;
	rightHeader: ReactNode;
}

export function ClinicPageTabs({ children, leftHeader, rightHeader }: ClinicPageTabsProps) {
	const [activeTab, setActiveTab] = useState("patients");

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="contents">
			<header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 h-16 bg-background/80 backdrop-blur-md border-b">
				<div className="flex items-center gap-4 min-w-0">
					{leftHeader}
				</div>

				<div className="flex-1 flex justify-center max-w-md mx-4">
					<TabsList className="bg-muted/50 border h-9">
						<TabsTrigger value="patients" className="text-xs px-4">Patients</TabsTrigger>
						<TabsTrigger value="staff" className="text-xs px-4">Staff</TabsTrigger>
						<TabsTrigger
							value="camera"
							className="text-xs px-4 text-emerald-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
						>
							Live Feed
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="flex items-center gap-3">
					{rightHeader}
				</div>
			</header>
			{children}
		</Tabs>
	);
}
