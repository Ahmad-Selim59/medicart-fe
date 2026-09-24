import { cache } from "react";

import { createClient } from "@/shared/lib/supabase/server";

export const getAppSession = cache(async () => {
	const supabase = await createClient();

	const [{ data: { user } }, { data: sessionData }] = await Promise.all([
		supabase.auth.getUser(),
		supabase.auth.getSession(),
	]);

	if (!user) {
		return null;
	}

	const [{ data: profile }, { data: memberships }] = await Promise.all([
		supabase.from("profiles").select("*").eq("id", user.id).single(),
		supabase.from("clinic_members").select("clinics(name)").eq("user_id", user.id),
	]);

	const clinicNames = (memberships ?? [])
		.map((membership) => (membership.clinics as { name?: string } | null)?.name)
		.filter((name): name is string => Boolean(name));

	const allowedClinicsQuery =
		clinicNames.length > 0
			? `?clinics=${encodeURIComponent(clinicNames.join(","))}`
			: "?clinics=__none__";

	return {
		user,
		profile,
		token: sessionData.session?.access_token ?? "",
		allowedClinicsQuery,
		clinicNames,
		isAdmin: profile?.role === "admin" || user.user_metadata?.role === "admin",
	};
});

export function backendAuthHeaders(token: string): HeadersInit {
	return token ? { Authorization: `Bearer ${token}` } : {};
}
