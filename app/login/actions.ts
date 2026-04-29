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

export async function forgotPassword(formData: FormData) {
	const supabase = await createClient();
	const email = (formData.get("email") as string)?.trim();

	// Recovery links use PKCE: Supabase appends ?code=... which must hit a route handler
	// that calls exchangeCodeForSession (see app/auth/callback/route.ts) so session
	// cookies exist before /reset-password runs updateUser.
	const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
	});

	if (error) {
		return { error: error.message };
	}

	return { success: true };
}

export async function updatePassword(formData: FormData) {
	const supabase = await createClient();
	const password = (formData.get("password") as string);

	const { error } = await supabase.auth.updateUser({ password });

	if (error) {
		return { error: error.message };
	}

	revalidatePath("/", "layout");
	return { success: true };
}

export async function changePassword(currentPassword: string, newPassword: string) {
	const supabase = await createClient();

	// Re-authenticate with current password first
	const { data: { user } } = await supabase.auth.getUser();
	if (!user?.email) {
		return { error: "Not authenticated" };
	}

	const { error: signInError } = await supabase.auth.signInWithPassword({
		email: user.email,
		password: currentPassword,
	});

	if (signInError) {
		return { error: "Current password is incorrect" };
	}

	const { error } = await supabase.auth.updateUser({ password: newPassword });

	if (error) {
		return { error: error.message };
	}

	return { success: true };
}
