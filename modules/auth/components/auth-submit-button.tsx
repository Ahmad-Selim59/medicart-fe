import { Loader2Icon } from "lucide-react";
import type { ReactNode } from "react";

export function AuthSubmitButton({
	loading,
	loadingLabel,
	children,
}: {
	loading: boolean;
	loadingLabel: string;
	children: ReactNode;
}) {
	return (
		<button
			type="submit"
			disabled={loading}
			className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-accent hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
		>
			{loading ? (
				<>
					<Loader2Icon className="size-[18px] animate-spin" />
					{loadingLabel}
				</>
			) : (
				children
			)}
		</button>
	);
}
