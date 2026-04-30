"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";

function normalizeAppOrigin(raw: string): string {
	return raw.trim().replace(/\/$/, "");
}

/** True if this looks like a dev machine origin (often baked into builds by mistake). */
function originHostIsLocal(origin: string): boolean {
	try {
		const withScheme = origin.includes("://") ? origin : `https://${origin}`;
		const host = new URL(withScheme).hostname.toLowerCase();
		return host === "localhost" || host === "127.0.0.1" || host === "::1";
	} catch {
		return false;
	}
}

/**
 * Public origin of this Next.js app for auth email links (not your API base).
 *
 * - Prefer `SITE_URL` (server-only, read at runtime on Vercel — set to `https://your-domain.com`).
 * - `NEXT_PUBLIC_SITE_URL` is inlined at **build time**; a local build or missing env at build can
 *   bake in `localhost` forever until you redeploy. On Vercel we detect that and fall back to
 *   `VERCEL_URL` (always set at runtime for the current deployment).
 */
function publicAppOrigin(): string {
	const siteUrl = process.env.SITE_URL?.trim();
	if (siteUrl) return normalizeAppOrigin(siteUrl);

	const nextPublic = process.env.NEXT_PUBLIC_SITE_URL?.trim();
	const vercelHost = process.env.VERCEL_URL?.trim();

	if (vercelHost && (!nextPublic || originHostIsLocal(nextPublic))) {
		const host = vercelHost.replace(/^https?:\/\//, "").replace(/\/$/, "");
		return `https://${host}`;
	}

	if (nextPublic) return normalizeAppOrigin(nextPublic);

	if (vercelHost) {
		const host = vercelHost.replace(/^https?:\/\//, "").replace(/\/$/, "");
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
