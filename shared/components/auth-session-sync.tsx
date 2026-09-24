"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";

const PUBLIC_AUTH_PREFIXES = ["/login", "/auth", "/forgot-password", "/reset-password"];

function isPublicAuthPath(pathname: string) {
	return PUBLIC_AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function AuthSessionSync() {
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const supabase = createClient();
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			// TOKEN_REFRESHED fires often in dev and was causing unnecessary RSC refetches.
			if (event === "SIGNED_IN") {
				router.refresh();
				return;
			}

			if (event === "SIGNED_OUT" && !isPublicAuthPath(pathname)) {
				router.refresh();
			}
		});

		return () => subscription.unsubscribe();
	}, [router, pathname]);

	return null;
}
