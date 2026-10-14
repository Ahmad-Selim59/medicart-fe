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

async function isPlatformAdmin(
	supabase: Awaited<ReturnType<typeof createClient>>,
	user: { id: string; user_metadata?: { role?: string } },
) {
	const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
	return profile?.role === "admin" || user.user_metadata?.role === "admin";
}

export async function deleteClinic(clinicName: string) {
	if (!clinicName || clinicName.trim() === "") {
		return { error: "Invalid clinic name" };
	}

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		return { error: "Not logged in" };
	}

	if (!(await isPlatformAdmin(supabase, user))) {
		return { error: "Only administrators can delete clinics." };
	}

	const { data: clinic, error: lookupError } = await supabase
		.from("clinics")
		.select("id")
		.eq("name", clinicName.trim())
		.single();

	if (lookupError || !clinic) {
		return { error: "Clinic not found." };
	}

	const { error: membersError } = await supabase
		.from("clinic_members")
		.delete()
		.eq("clinic_id", clinic.id);

	if (membersError) {
		return { error: `Failed to remove clinic members: ${membersError.message}` };
	}

	const { error: deleteError } = await supabase.from("clinics").delete().eq("id", clinic.id);

	if (deleteError) {
		return { error: `Failed to delete clinic: ${deleteError.message}` };
	}

	revalidatePath("/clinic");
	return { success: true };
}
