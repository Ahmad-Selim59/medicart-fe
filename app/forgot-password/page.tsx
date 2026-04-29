"use client";

import { useState } from "react";
import { forgotPassword } from "@/app/login/actions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { HospitalIcon, ArrowLeftIcon, CheckCircleIcon } from "lucide-react";
import Link from "next/link";

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
		<div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2 text-center">
					<div className="flex justify-center mb-2">
						<div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<HospitalIcon className="size-6" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold tracking-tight">
						Reset your password
					</CardTitle>
					<CardDescription>
						{success
							? "Check your inbox for a reset link"
							: "Enter your email and we'll send you a reset link"}
					</CardDescription>
				</CardHeader>

				<CardContent>
					{success ? (
						<div className="flex flex-col items-center gap-3 py-4 text-center">
							<CheckCircleIcon className="size-12 text-emerald-500" />
							<p className="text-sm text-muted-foreground">
								We've sent a password reset link to your email. Please check your inbox (and spam folder).
							</p>
						</div>
					) : (
						<form action={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="email" className="text-sm font-medium leading-none">
									Email address
								</label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
								/>
							</div>

							{error && (
								<div className="text-sm font-medium text-red-500">
									{error}
								</div>
							)}

							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? "Sending..." : "Send reset link"}
							</Button>
						</form>
					)}
				</CardContent>

				<CardFooter className="flex justify-center border-t p-4">
					<Link
						href="/login"
						className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
					>
						<ArrowLeftIcon className="size-3.5" />
						Back to login
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
