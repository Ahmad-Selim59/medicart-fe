import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

export function AuthError({ children }: { children: ReactNode }) {
	return (
		<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
			{children}
		</div>
	);
}

export function AuthSuccess({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col items-center gap-3 py-4 text-center", className)}>
			{children}
		</div>
	);
}
