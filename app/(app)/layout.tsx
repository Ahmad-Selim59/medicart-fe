import { AppSidebar } from "@/shared/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { createClient } from "@/shared/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	let profile = null;
	const { data } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", user.id)
		.single();
	profile = data;

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
