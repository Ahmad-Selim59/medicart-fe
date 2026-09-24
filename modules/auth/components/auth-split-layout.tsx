import { LoginBrandPanel } from "@/modules/auth/components/login-brand-panel";
import { AuthFooter } from "@/modules/auth/components/auth-footer";
import { AuthPartnerLogos } from "@/modules/auth/components/auth-partner-logos";
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

			<div className="flex min-h-screen w-full flex-col bg-background px-4 py-8 sm:px-12 lg:w-[56%] lg:px-20 lg:py-14">
				{topLink ? (
					<div className="mb-4 flex w-full items-center justify-end lg:mb-0">
						<Link
							href={topLink.href}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							{topLink.label}
						</Link>
					</div>
				) : null}

				<div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-4 lg:my-auto lg:py-8">
					{children}

					<div className="mt-10 lg:hidden">
						<AuthPartnerLogos variant="light" />
					</div>
				</div>

				<AuthFooter />
			</div>
		</div>
	);
}
