"use client";

import { login, signup } from "@/app/login/actions";
import { AuthError } from "@/modules/auth/components/auth-message";
import { AuthField } from "@/modules/auth/components/auth-field";
import { AuthFormHeader } from "@/modules/auth/components/auth-form-header";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { AuthSubmitButton } from "@/modules/auth/components/auth-submit-button";
import {
	ArrowRightIcon,
	EyeIcon,
	EyeOffIcon,
	LockIcon,
	MailIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export default function LoginPage() {
	const [isLogin, setIsLogin] = useState(true);
	const [role, setRole] = useState("doctor");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	async function handleSubmit(formData: FormData) {
		setLoading(true);
		setError(null);
		formData.append("role", role);

		const result = isLogin ? await login(formData) : await signup(formData);

		if (result?.error) {
			setError(result.error);
			setLoading(false);
		}
	}

	return (
		<AuthSplitLayout>
			<AuthFormHeader
				title={isLogin ? "Welcome back" : "Create an account"}
				description={
					isLogin
						? "Enter your email below to log into your account"
						: "Choose your role and enter your details to get started"
				}
			/>

			<form action={handleSubmit} className="space-y-5">
				{!isLogin && (
					<div className="space-y-5">
						<div className="space-y-1.5">
							<label className="block text-sm font-semibold text-foreground">
								I am a...
							</label>
							<Tabs value={role} onValueChange={setRole} className="w-full">
								<TabsList className="grid h-11 w-full grid-cols-2 rounded-lg bg-secondary p-1">
									<TabsTrigger
										value="doctor"
										className="rounded-md data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
									>
										Doctor
									</TabsTrigger>
									<TabsTrigger
										value="admin"
										className="rounded-md data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
									>
										Clinic Admin
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						<AuthField
							id="fullName"
							name="fullName"
							label="Full Name"
							placeholder={role === "doctor" ? "Dr. John Doe" : "Clinic Admin"}
							required={!isLogin}
						/>
					</div>
				)}

				<AuthField
					id="email"
					name="email"
					type="email"
					label="Email"
					icon={MailIcon}
					placeholder="m@example.com"
					required
				/>

				<AuthField
					id="password"
					name="password"
					type={showPassword ? "text" : "password"}
					label="Password"
					icon={LockIcon}
					placeholder="••••••••••••"
					required
					minLength={6}
					footer={
						isLogin ? (
							<Link
								href="/forgot-password"
								className="text-sm font-medium text-primary transition-colors hover:text-accent"
							>
								Forgot password?
							</Link>
						) : undefined
					}
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

				{error && <AuthError>{error}</AuthError>}

				<AuthSubmitButton
					loading={loading}
					loadingLabel={isLogin ? "Authenticating..." : "Creating account..."}
				>
					{isLogin ? "Log in" : "Sign up"}
					<ArrowRightIcon className="size-[18px]" />
				</AuthSubmitButton>
			</form>

			<div className="mt-8 text-center">
				<p className="text-sm text-muted-foreground">
					{isLogin ? "Don't have an account? " : "Already have an account? "}
					<button
						type="button"
						onClick={() => {
							setIsLogin(!isLogin);
							setError(null);
							setShowPassword(false);
						}}
						className="ml-1 font-semibold text-primary transition-colors hover:text-accent"
					>
						{isLogin ? "Sign up" : "Log in"}
					</button>
				</p>
			</div>
		</AuthSplitLayout>
	);
}
