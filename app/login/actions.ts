"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Public origin of this Next.js app (Vercel / local dev). Password reset & OAuth redirects
 * must land on this origin — not NEXT_PUBLIC_* API base, which points at the backend.
 */
function publicAppOrigin(): string {
	const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
	if (explicit) return explicit.replace(/\/$/, "");

	// Preview & production deployments: https://vercel.com/docs/projects/environment-variables/system-environment-variables
	const vercel = process.env.VERCEL_URL?.trim();
	if (vercel) {
		const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
		return `https://${host}`;
	}

	return "http://localhost:3000";
}

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

	// Recovery links use PKCE: Supabase appends ?code=... — must hit /auth/callback first
	// so exchangeCodeForSession sets cookies before /reset-password.
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${publicAppOrigin()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
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
