import Image from "next/image";

export function AuthPartnerLogos() {
	return (
		<div className="relative z-10 border-t border-white/15 pt-6">
			<p className="mb-4 text-[11px] font-semibold tracking-widest text-auth-panel-muted/80 uppercase">
				A service by
			</p>
			<div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 items-center justify-center sm:justify-start">
					<Image
						src="/medtechfinal.png"
						alt="MEDtech"
						width={180}
						height={48}
						className="h-10 w-auto max-w-[180px] object-contain"
					/>
				</div>
				<div className="hidden h-8 w-px bg-white/15 sm:block" aria-hidden />
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
