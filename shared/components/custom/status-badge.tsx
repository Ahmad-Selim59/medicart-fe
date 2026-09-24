import { cn } from "@/shared/lib/utils";

type BadgeStatus = "stable" | "critical" | "warning" | "online" | "offline";

interface StatusBadgeProps {
	status: BadgeStatus;
	size?: "sm" | "default";
	bordered?: boolean;
}

const statusConfig: Record<BadgeStatus, { label: string; dotClass: string; textClass: string; bgClass: string; borderClass: string }> = {
	stable: {
		label: "Stable",
		dotClass: "bg-emerald-500",
		textClass: "text-emerald-700 dark:text-emerald-300",
		bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
		borderClass: "border-emerald-200/60 dark:border-emerald-800/60",
	},
	critical: {
		label: "Critical",
		dotClass: "bg-red-500",
		textClass: "text-red-700 dark:text-red-300",
		bgClass: "bg-red-50 dark:bg-red-950/40",
		borderClass: "border-red-200/60 dark:border-red-800/60",
	},
	warning: {
		label: "Review Needed",
		dotClass: "bg-amber-500",
		textClass: "text-amber-700 dark:text-amber-300",
		bgClass: "bg-amber-50 dark:bg-amber-950/40",
		borderClass: "border-amber-200/80 dark:border-amber-800/60",
	},
	online: {
		label: "Online",
		dotClass: "bg-emerald-500",
		textClass: "text-emerald-700 dark:text-emerald-300",
		bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
		borderClass: "border-emerald-200/60 dark:border-emerald-800/60",
	},
	offline: {
		label: "Offline",
		dotClass: "bg-slate-400",
		textClass: "text-slate-600 dark:text-slate-300",
		bgClass: "bg-slate-100 dark:bg-slate-900/40",
		borderClass: "border-slate-200 dark:border-slate-700",
	},
};

export function StatusBadge({ status, size = "default", bordered = false }: StatusBadgeProps) {
	const config = statusConfig[status];
	return (
		<span className={cn(
			"inline-flex items-center gap-1.5 rounded-full font-medium",
			config.textClass,
			config.bgClass,
			bordered && "border",
			bordered && config.borderClass,
			size === "sm" ? "px-2.5 py-1 text-xs" : "px-2.5 py-0.5 text-xs",
		)}
		>
			<span className={cn("rounded-full", config.dotClass, size === "sm" ? "size-1.5" : "size-2")} />
			{config.label}
		</span>
	);
}
