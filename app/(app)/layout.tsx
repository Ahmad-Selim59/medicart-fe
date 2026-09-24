import { AppSidebar } from "@/shared/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { getAppSession } from "@/shared/lib/auth/app-session";
import { redirect } from "next/navigation";

export default async function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getAppSession();

	if (!session) {
		redirect("/login");
	}

	const { user, profile } = session;
	const userData = {
		name: profile?.full_name || user.user_metadata?.full_name || "User",
		email: user.email!,
		avatar: "",
		role: profile?.role || user.user_metadata?.role || "doctor",
	};

	return (
		<SidebarProvider defaultOpen={true}>
			<AppSidebar user={userData} />
			<SidebarInset>
				<main className="flex-1">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
