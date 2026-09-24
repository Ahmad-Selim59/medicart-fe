"use client";

import { updatePassword } from "@/app/login/actions";
import { AuthError, AuthSuccess } from "@/modules/auth/components/auth-message";
import { AuthField } from "@/modules/auth/components/auth-field";
import { AuthFormHeader } from "@/modules/auth/components/auth-form-header";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { AuthSubmitButton } from "@/modules/auth/components/auth-submit-button";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CheckCircle2Icon,
	EyeIcon,
	EyeOffIcon,
	LockIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	async function handleSubmit(formData: FormData) {
		setLoading(true);
		setError(null);

		const password = formData.get("password") as string;
		const confirm = formData.get("confirm") as string;

		if (password !== confirm) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		const result = await updatePassword(formData);

		if (result?.error) {
			setError(result.error);
		} else {
			setSuccess(true);
			setTimeout(() => router.push("/"), 2000);
		}
		setLoading(false);
	}

	return (
		<AuthSplitLayout topLink={{ href: "/login", label: "Back to login" }}>
			<AuthFormHeader
				title="Set new password"
				description={success ? "Password updated successfully" : "Choose a strong new password"}
			/>

			{success ? (
				<AuthSuccess>
					<CheckCircle2Icon className="size-12 text-primary" />
					<p className="text-sm text-muted-foreground">
						Your password has been updated. Redirecting you now...
					</p>
				</AuthSuccess>
			) : (
				<form action={handleSubmit} className="space-y-5">
					<AuthField
						id="password"
						name="password"
						type={showPassword ? "text" : "password"}
						label="New password"
						icon={LockIcon}
						placeholder="••••••••••••"
						required
						minLength={6}
						trailingAction={
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="p-1 text-muted-foreground transition-colors hover:text-foreground"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
							</button>
						}
					/>

					<AuthField
						id="confirm"
						name="confirm"
						type={showConfirm ? "text" : "password"}
						label="Confirm new password"
						icon={LockIcon}
						placeholder="••••••••••••"
						required
						minLength={6}
						trailingAction={
							<button
								type="button"
								onClick={() => setShowConfirm(!showConfirm)}
								className="p-1 text-muted-foreground transition-colors hover:text-foreground"
								aria-label={showConfirm ? "Hide password" : "Show password"}
							>
								{showConfirm ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
							</button>
						}
					/>

					{error && <AuthError>{error}</AuthError>}

					<AuthSubmitButton loading={loading} loadingLabel="Updating...">
						Update password
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
