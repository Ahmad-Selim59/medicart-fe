"use client";

import { forgotPassword } from "@/app/login/actions";
import { AuthError, AuthSuccess } from "@/modules/auth/components/auth-message";
import { AuthField } from "@/modules/auth/components/auth-field";
import { AuthFormHeader } from "@/modules/auth/components/auth-form-header";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { AuthSubmitButton } from "@/modules/auth/components/auth-submit-button";
import { useAuthFormSubmit } from "@/modules/auth/hooks/use-auth-form-submit";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, MailIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
	const [success, setSuccess] = useState(false);
	const { loading, error, handleSubmit } = useAuthFormSubmit(forgotPassword, {
		onSuccess: () => setSuccess(true),
	});

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
				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<fieldset disabled={loading} className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0">
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
					</fieldset>

					<AuthSubmitButton loading={loading} loadingLabel="Sending reset link...">
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
