"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";

export async function login(formData: FormData) {
	const supabase = await createClient();

	const email = (formData.get("email") as string)?.trim();
	const password = (formData.get("password") as string);

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return { error: error.message };
	}

	revalidatePath("/", "layout");
	redirect("/");
}

export async function signup(formData: FormData) {
	const supabase = await createClient();

	const email = (formData.get("email") as string)?.trim();
	const password = (formData.get("password") as string);
	const fullName = (formData.get("fullName") as string)?.trim();
	const role = (formData.get("role") as string);

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				full_name: fullName,
				role: role,
			},
		},
	});

	if (error) {
		return { error: error.message };
	}

	revalidatePath("/", "layout");
	redirect("/");
}

export async function logout() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	revalidatePath("/", "layout");
	redirect("/login");
}
