import { ServerCrashIcon } from "lucide-react";

import { API_BASE } from "@/shared/api/client";

export function BackendConnectionAlert() {
	return (
		<div
			role="alert"
			className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm"
		>
			<div className="flex gap-3">
				<ServerCrashIcon className="mt-0.5 size-4 shrink-0 text-primary" />
				<div className="space-y-1">
					<p className="font-medium text-foreground">
						Unable to connect to the server
					</p>
					<p className="text-muted-foreground">
						We couldn&apos;t reach the Medicart backend at{" "}
						<span className="font-mono text-xs">{API_BASE}</span>. You&apos;re
						signed in, but clinic data won&apos;t load until the server is
						available.
					</p>
					<p className="text-xs text-muted-foreground">
						If you&apos;re running locally, start the web server from{" "}
						<span className="font-mono">medicart/web-server</span> with{" "}
						<span className="font-mono">go run .</span>
					</p>
				</div>
			</div>
		</div>
	);
}
