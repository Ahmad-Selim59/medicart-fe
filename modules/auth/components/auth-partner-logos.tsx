import Image from "next/image";
import { cn } from "@/shared/lib/utils";

export function AuthPartnerLogos({ variant = "panel" }: { variant?: "panel" | "light" }) {
	const isPanel = variant === "panel";

	return (
		<div
			className={cn(
				"relative z-10",
				isPanel ? "border-t border-white/15 pt-6" : "border-t border-border pt-8",
			)}
		>
			<p
				className={cn(
					"mb-4 text-[11px] font-semibold tracking-widest uppercase",
					isPanel ? "text-auth-panel-muted/80" : "text-muted-foreground",
				)}
			>
				A service by
			</p>
			<div
				className={cn(
					"flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
					isPanel
						? "border-white/10 bg-black/20"
						: "border-border bg-muted/40",
				)}
			>
				<div className="flex flex-1 items-center justify-center sm:justify-start">
					<Image
						src="/medtechfinal.png"
						alt="MEDtech"
						width={180}
						height={48}
						className="h-10 w-auto max-w-[180px] object-contain"
					/>
				</div>
				<div
					className={cn("hidden h-8 w-px sm:block", isPanel ? "bg-white/15" : "bg-border")}
					aria-hidden
				/>
				<div className="flex flex-1 items-center justify-center sm:justify-end">
					<Image
						src="/saab-1.png"
						alt="SAAB Solution Provider"
						width={200}
						height={56}
						className="h-11 w-auto max-w-[200px] object-contain"
					/>
				</div>
			</div>
		</div>
	);
}
