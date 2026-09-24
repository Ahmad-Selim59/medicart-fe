import { LoginBrandPanel } from "@/modules/auth/components/login-brand-panel";
import { AuthFooter } from "@/modules/auth/components/auth-footer";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthSplitLayout({
	children,
	topLink,
}: {
	children: ReactNode;
	topLink?: { href: string; label: string };
}) {
	return (
		<div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
			<LoginBrandPanel />

			<div className="flex min-h-screen w-full flex-col justify-between bg-background px-6 py-10 sm:px-12 lg:w-[56%] lg:px-20 lg:py-14">
				{topLink ? (
					<div className="flex w-full items-center justify-end">
						<Link
							href={topLink.href}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							{topLink.label}
						</Link>
					</div>
				) : null}

				<div className="mx-auto my-auto w-full max-w-md py-8">{children}</div>

				<AuthFooter />
			</div>
		</div>
	);
}
