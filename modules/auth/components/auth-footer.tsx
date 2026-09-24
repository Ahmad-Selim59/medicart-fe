export function AuthFooter() {
	return (
		<div className="flex w-full flex-col items-center justify-between gap-3 border-t border-border pt-6 text-center text-[11px] text-muted-foreground sm:flex-row lg:text-left">
			<p>© Medicart. All rights reserved.</p>
			<div className="flex items-center gap-4">
				<span className="transition-colors hover:text-foreground">Privacy Policy</span>
				<span>•</span>
				<span className="transition-colors hover:text-foreground">Terms of Service</span>
			</div>
		</div>
	);
}
