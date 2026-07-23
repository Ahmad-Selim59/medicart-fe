"use server";

import { createClient } from "@/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function removeDoctor(clinicId: string, userId: string) {
	const supabase = await createClient();

	// 1. Check if the current user is an admin of this clinic
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return { error: "Not authenticated" };

	const { data: adminMember } = await supabase
		.from("clinic_members")
		.select("role")
		.eq("clinic_id", clinicId)
		.eq("user_id", user.id)
		.single();

	if (adminMember?.role !== "admin") {
		return { error: "Only admins can remove staff." };
	}

	// 2. Delete the membership
	const { error } = await supabase
		.from("clinic_members")
		.delete()
		.eq("clinic_id", clinicId)
		.eq("user_id", userId)
		.eq("role", "doctor"); // Safety check: only remove doctors

	if (error) {
		return { error: `Failed to remove doctor: ${error.message}` };
	}

	revalidatePath(`/clinic/${clinicId}`);
	return { success: true };
}
