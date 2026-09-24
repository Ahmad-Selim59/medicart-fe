import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export function AuthField({
	label,
	icon: Icon,
	labelAction,
	trailingAction,
	footer,
	className,
	inputClassName,
	...props
}: {
	label: string;
	icon?: LucideIcon;
	labelAction?: ReactNode;
	trailingAction?: ReactNode;
	footer?: ReactNode;
	className?: string;
	inputClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
	return (
		<div className={cn("space-y-1.5", className)}>
			<div className={cn(labelAction ? "flex items-center justify-between" : undefined)}>
				<label htmlFor={props.id} className="block text-sm font-semibold text-foreground">
					{label}
				</label>
				{labelAction}
			</div>
			<div className="relative flex items-center">
				{Icon ? (
					<Icon className="pointer-events-none absolute left-3.5 size-5 text-muted-foreground" />
				) : null}
				<input
					{...props}
					className={cn(
						"w-full rounded-lg border border-input bg-card py-3 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground/70 focus:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring/30",
						Icon ? "pl-11" : "px-4",
						trailingAction ? "pr-12" : "pr-4",
						inputClassName,
					)}
				/>
				{trailingAction ? (
					<div className="absolute right-3.5 flex items-center justify-center">
						{trailingAction}
					</div>
				) : null}
			</div>
			{footer ? <div className="flex justify-end pt-1">{footer}</div> : null}
		</div>
	);
}
