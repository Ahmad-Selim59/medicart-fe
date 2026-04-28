"use client";
import { GalleryVerticalEndIcon, HospitalIcon, HouseIcon, UserIcon } from "lucide-react";
import * as React from "react";

import { NavUser } from "@/shared/components/nav-user";
import { NavMain } from "@/shared/components/nav-main";
import { TeamSwitcher } from "@/shared/components/team-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/shared/components/ui/sidebar";

const data = {
	teams: [
		{
			name: "Medicart",
			logo: (
				<GalleryVerticalEndIcon />
			),
			plan: "Enterprise",
		},
	],
	navMain: [
		{
			title: "Home",
			url: "/",
			icon: (
				<HouseIcon />
			),
			isActive: true,
		},
		{
			title: "Clinic",
			url: "/clinic",
			icon: (
				<HospitalIcon />
			),
		},
		{
			title: "Patients",
			url: "/patient",
			icon: (
				<UserIcon />
			),
		},
	],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	user: {
		name: string;
		email: string;
		avatar: string;
		role: string;
	};
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<div className="flex items-center gap-3">
					<NavUser user={user} />
				</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
