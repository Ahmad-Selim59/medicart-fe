"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";

export function AuthSessionSync() {
	const router = useRouter();

	useEffect(() => {
		const supabase = createClient();
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
				router.refresh();
			}
		});

		return () => subscription.unsubscribe();
	}, [router]);

	return null;
}
