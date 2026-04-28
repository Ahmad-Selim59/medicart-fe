"use server";

import { createClient } from "@/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addClinic(clinicIdOrName: string, doctorEmails: string[] = []) {
	if (!clinicIdOrName || clinicIdOrName.trim() === "") {
		return { error: "Invalid clinic name" };
	}

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		return { error: "Not logged in" };
	}

	// 1. Find or create the clinic
	let finalClinicId = "";
	const { data: existingClinic } = await supabase
		.from("clinics")
		.select("id")
		.eq("name", clinicIdOrName)
		.single();

	if (existingClinic) {
		finalClinicId = existingClinic.id;
		
		// Check if already a member
		const { data: membership } = await supabase
			.from("clinic_members")
			.select("id")
			.eq("clinic_id", finalClinicId)
			.eq("user_id", user.id)
			.single();
		
		if (membership) {
			return { error: "You are already a member of this clinic." };
		}
	} else {
		const { data: newClinic, error: createError } = await supabase
			.from("clinics")
			.insert([{ name: clinicIdOrName }])
			.select("id")
			.single();
		
		if (createError) {
			return { error: `Database Error: ${createError.message} (${createError.code})` };
		}
		if (!newClinic) {
			return { error: "Failed to create clinic entry - no data returned." };
		}
		finalClinicId = newClinic.id;
	}

	// 2. Add current user as admin
	await supabase
		.from("clinic_members")
		.insert([{
			clinic_id: finalClinicId,
			user_id: user.id,
			role: "admin"
		}]);

	// 3. Process doctor invitations
	const invited = [];
	for (const email of doctorEmails) {
		if (!email.trim()) continue;
		
		const { data: profile } = await supabase
			.from("profiles")
			.select("id")
			.eq("email", email)
			.single();
		
		if (profile) {
			await supabase
				.from("clinic_members")
				.insert([{
					clinic_id: finalClinicId,
					user_id: profile.id,
					role: "doctor"
				}]);
			invited.push(email);
		}
	}

	revalidatePath("/clinic");
	return { success: true, invited };
}
