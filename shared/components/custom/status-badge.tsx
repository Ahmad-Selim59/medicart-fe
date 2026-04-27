import { cn } from "@/shared/lib/utils";

type BadgeStatus = "stable" | "critical" | "warning" | "online" | "offline";

interface StatusBadgeProps {
	status: BadgeStatus;
	size?: "sm" | "default";
}

const statusConfig: Record<BadgeStatus, { label: string; dotClass: string; textClass: string; bgClass: string }> = {
	stable: { label: "Stable", dotClass: "bg-emerald-500", textClass: "text-emerald-700", bgClass: "bg-emerald-50" },
	critical: { label: "Critical", dotClass: "bg-red-500", textClass: "text-red-700", bgClass: "bg-red-50" },
	warning: { label: "Warning", dotClass: "bg-amber-500", textClass: "text-amber-700", bgClass: "bg-amber-50" },
	online: { label: "Online", dotClass: "bg-emerald-500", textClass: "text-emerald-700", bgClass: "bg-emerald-50" },
	offline: { label: "Offline", dotClass: "bg-slate-400", textClass: "text-slate-600", bgClass: "bg-slate-100" },
};

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
	const config = statusConfig[status];
	return (
		<span className={cn(
			"inline-flex items-center gap-1.5 rounded-full font-medium",
			config.textClass,
			config.bgClass,
			size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
		)}
		>
			<span className={cn("rounded-full", config.dotClass, size === "sm" ? "size-1.5" : "size-2")} />
			{config.label}
		</span>
	);
}
