import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/shared/components/custom/theme-provider";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

import { createClient } from "@/shared/lib/supabase/server";

export const metadata: Metadata = {
	title: "Medicart Dashboard",
	description: "Real-time monitoring across all clinics",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	let profile = null;
	if (user) {
		const { data } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", user.id)
			.single();
		profile = data;
	}

	const userData = user ? {
		name: profile?.full_name || user.user_metadata?.full_name || "User",
		email: user.email!,
		avatar: "",
		role: profile?.role || user.user_metadata?.role || "doctor",
	} : null;

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{userData ? (
						<SidebarProvider defaultOpen={true}>
							<AppSidebar user={userData} />
							<SidebarInset>
								<main className="flex-1">
									{children}
								</main>
							</SidebarInset>
						</SidebarProvider>
					) : (
						<main className="flex-1">
							{children}
						</main>
					)}
				</ThemeProvider>
			</body>
		</html>
	);
}
