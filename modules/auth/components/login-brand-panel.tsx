import { AuthPartnerLogos } from "@/modules/auth/components/auth-partner-logos";

export function LoginBrandPanel() {
	return (
		<div className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-auth-brand-from via-auth-brand-via to-auth-brand-to p-8 text-white lg:w-[44%] lg:p-14">
			<div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-auth-accent-dim/15 blur-3xl" />
			<div className="pointer-events-none absolute top-1/2 -right-24 size-80 rounded-full bg-auth-accent-soft/10 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-24 left-1/4 size-72 rounded-full bg-auth-accent/15 blur-3xl" />

			<div className="relative z-10 flex items-center gap-2.5">
				<div className="size-2.5 animate-pulse rounded-full bg-auth-accent" />
				<span className="text-base font-semibold tracking-tight">Medicart</span>
			</div>

			<div className="relative z-10 my-auto py-10">
				<div className="relative mx-auto mb-10 flex w-full max-w-sm items-center justify-center">
					<svg
						className="size-64 text-auth-accent/20"
						fill="none"
						viewBox="0 0 240 240"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden
					>
						<defs>
							<linearGradient id="orbitGrad1" x1="0%" x2="100%" y1="0%" y2="100%">
								<stop offset="0%" stopColor="var(--auth-accent)" stopOpacity="0.8" />
								<stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
							</linearGradient>
							<linearGradient id="orbitGrad2" x1="100%" x2="0%" y1="0%" y2="100%">
								<stop offset="0%" stopColor="var(--auth-accent-soft)" stopOpacity="0.6" />
								<stop offset="100%" stopColor="var(--auth-brand-via)" stopOpacity="0.05" />
							</linearGradient>
						</defs>
						<ellipse
							cx="120"
							cy="120"
							rx="104"
							ry="46"
							stroke="url(#orbitGrad1)"
							strokeDasharray="6 4"
							strokeWidth="1.5"
							transform="rotate(-28 120 120)"
						/>
						<ellipse
							cx="120"
							cy="120"
							rx="104"
							ry="46"
							stroke="url(#orbitGrad2)"
							strokeWidth="1.5"
							transform="rotate(32 120 120)"
						/>
						<circle cx="120" cy="120" r="70" stroke="var(--auth-accent-soft)" strokeOpacity="0.25" strokeWidth="1" />
						<circle cx="120" cy="120" r="44" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="1.5" />
						<circle cx="120" cy="120" r="16" fill="var(--accent)" fillOpacity="0.6" />
						<circle cx="120" cy="120" r="8" fill="var(--auth-accent)" />
						<circle cx="62" cy="78" r="4.5" fill="var(--auth-accent-soft)" />
						<circle cx="178" cy="162" r="5" fill="var(--auth-accent)" />
						<circle cx="186" cy="88" r="3.5" fill="#ffffff" fillOpacity="0.75" />
						<circle cx="54" cy="152" r="4" fill="var(--auth-accent-dim)" />
						<path
							d="M72 120 C 95 100, 105 138, 120 120 C 135 102, 145 140, 168 120"
							fill="none"
							opacity="0.8"
							stroke="var(--auth-accent-soft)"
							strokeLinecap="round"
							strokeWidth="1.5"
						/>
					</svg>
				</div>

				<h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-[3rem]">
					Your health, connected.
				</h1>
				<p className="mb-8 max-w-lg text-base leading-relaxed text-auth-panel-muted/90 sm:text-lg">
					A calm, unified platform for real-time patient monitoring, clinical coordination,
					and secure health records across every clinic you manage.
				</p>
			</div>

			<AuthPartnerLogos />
		</div>
	);
}
