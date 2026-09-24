import { HospitalIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AuthFormHeader({
	title,
	description,
	icon,
}: {
	title: string;
	description: ReactNode;
	icon?: ReactNode;
}) {
	return (
		<>
			<div className="mb-8 flex justify-center">
				<div className="flex size-12 items-center justify-center rounded-xl bg-secondary p-1.5 shadow-sm">
					<div className="flex size-full items-center justify-center rounded-lg bg-primary text-primary-foreground">
						{icon ?? <HospitalIcon className="size-6" />}
					</div>
				</div>
			</div>

			<div className="mb-8 text-center">
				<h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-[2rem] sm:leading-10">
					{title}
				</h2>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
		</>
	);
}
