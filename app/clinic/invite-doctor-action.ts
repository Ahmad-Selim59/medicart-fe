"use server";

import { createClient } from "@/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function inviteDoctor(clinicId: string, email: string) {
	const supabase = await createClient();

	// 1. Find the user by email in the profiles table
	const { data: doctorProfile, error: profileError } = await supabase
		.from("profiles")
		.select("id, role")
		.eq("email", email)
		.single();

	if (profileError || !doctorProfile) {
		return { error: "User with this email not found." };
	}

	if (doctorProfile.role !== "doctor") {
		return { error: "This user is not registered as a doctor." };
	}

	// 2. Check if already a member
	const { data: existingMember } = await supabase
		.from("clinic_members")
		.select("id")
		.eq("clinic_id", clinicId)
		.eq("user_id", doctorProfile.id)
		.single();

	if (existingMember) {
		return { error: "Doctor is already a member of this clinic." };
	}

	// 3. Add them to clinic_members
	const { error: insertError } = await supabase
		.from("clinic_members")
		.insert([{
			clinic_id: clinicId,
			user_id: doctorProfile.id,
			role: "doctor"
		}]);

	if (insertError) {
		return { error: "Failed to add doctor to clinic." };
	}

	revalidatePath(`/clinic/${clinicId}`);
	return { success: true };
}
