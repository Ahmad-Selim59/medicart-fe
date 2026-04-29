"use client";

import { useState } from "react";
import { updatePassword } from "@/app/login/actions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { HospitalIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
		<div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2 text-center">
					<div className="flex justify-center mb-2">
						<div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<HospitalIcon className="size-6" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold tracking-tight">
						Set new password
					</CardTitle>
					<CardDescription>
						{success ? "Password updated successfully" : "Choose a strong new password"}
					</CardDescription>
				</CardHeader>

				<CardContent>
					{success ? (
						<div className="flex flex-col items-center gap-3 py-4 text-center">
							<CheckCircleIcon className="size-12 text-emerald-500" />
							<p className="text-sm text-muted-foreground">
								Your password has been updated. Redirecting you now...
							</p>
						</div>
					) : (
						<form action={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium leading-none">
									New password
								</label>
								<div className="relative">
									<Input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										required
										minLength={6}
										className="pr-10"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label={showPassword ? "Hide password" : "Show password"}
									>
										{showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
									</button>
								</div>
							</div>

							<div className="space-y-2">
								<label htmlFor="confirm" className="text-sm font-medium leading-none">
									Confirm new password
								</label>
								<div className="relative">
									<Input
										id="confirm"
										name="confirm"
										type={showConfirm ? "text" : "password"}
										required
										minLength={6}
										className="pr-10"
									/>
									<button
										type="button"
										onClick={() => setShowConfirm(!showConfirm)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label={showConfirm ? "Hide password" : "Show password"}
									>
										{showConfirm ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
									</button>
								</div>
							</div>

							{error && (
								<div className="text-sm font-medium text-red-500">
									{error}
								</div>
							)}

							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? "Updating..." : "Update password"}
							</Button>
						</form>
					)}
				</CardContent>

				<CardFooter className="flex justify-center border-t p-4">
					<Link
						href="/login"
						className="text-sm text-muted-foreground hover:text-primary transition-colors"
					>
						Back to login
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
