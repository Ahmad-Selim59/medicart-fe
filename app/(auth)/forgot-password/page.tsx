"use client";

import { forgotPassword } from "@/app/login/actions";
import { AuthError, AuthSuccess } from "@/modules/auth/components/auth-message";
import { AuthField } from "@/modules/auth/components/auth-field";
import { AuthFormHeader } from "@/modules/auth/components/auth-form-header";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { AuthSubmitButton } from "@/modules/auth/components/auth-submit-button";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, MailIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	async function handleSubmit(formData: FormData) {
		setLoading(true);
		setError(null);

		const result = await forgotPassword(formData);

		if (result?.error) {
			setError(result.error);
		} else {
			setSuccess(true);
		}
		setLoading(false);
	}

	return (
		<AuthSplitLayout topLink={{ href: "/login", label: "Back to login" }}>
			<AuthFormHeader
				title="Reset your password"
				description={
					success
						? "Check your inbox for a reset link"
						: "Enter your email and we'll send you a reset link"
				}
			/>

			{success ? (
				<AuthSuccess>
					<CheckCircle2Icon className="size-12 text-primary" />
					<p className="text-sm text-muted-foreground">
						We&apos;ve sent a password reset link to your email. Please check your inbox
						(and spam folder).
					</p>
					<Link
						href="/login"
						className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-accent"
					>
						<ArrowLeftIcon className="size-4" />
						Back to login
					</Link>
				</AuthSuccess>
			) : (
				<form action={handleSubmit} className="space-y-5">
					<AuthField
						id="email"
						name="email"
						type="email"
						label="Email address"
						icon={MailIcon}
						placeholder="m@example.com"
						required
					/>

					{error && <AuthError>{error}</AuthError>}

					<AuthSubmitButton loading={loading} loadingLabel="Sending...">
						Send reset link
						<ArrowRightIcon className="size-[18px]" />
					</AuthSubmitButton>
				</form>
			)}

			{!success && (
				<div className="mt-8 text-center">
					<Link
						href="/login"
						className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
					>
						<ArrowLeftIcon className="size-4" />
						Back to login
					</Link>
				</div>
			)}
		</AuthSplitLayout>
	);
}
