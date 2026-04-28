"use client";

import { useActionState } from "react";
import { login, signup } from "./actions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { HospitalIcon } from "lucide-react";
import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export default function LoginPage() {
	const [isLogin, setIsLogin] = useState(true);
	const [role, setRole] = useState("doctor");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(formData: FormData) {
		setLoading(true);
		setError(null);

		// Append role to formData
		formData.append("role", role);

		let result;
		if (isLogin) {
			result = await login(formData);
		} else {
			result = await signup(formData);
		}

		if (result?.error) {
			setError(result.error);
			setLoading(false);
		}
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
						{isLogin ? "Welcome back" : "Create an account"}
					</CardTitle>
					<CardDescription>
						{isLogin
							? "Enter your email below to log into your account"
							: "Choose your role and enter your details to get started"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={handleSubmit} className="space-y-4">
						{!isLogin && (
							<div className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium leading-none">
										I am a...
									</label>
									<Tabs value={role} onValueChange={setRole} className="w-full">
										<TabsList className="w-full grid grid-cols-2">
											<TabsTrigger value="doctor">Doctor</TabsTrigger>
											<TabsTrigger value="admin">Clinic Admin</TabsTrigger>
										</TabsList>
									</Tabs>
								</div>
								<div className="space-y-2">
									<label htmlFor="fullName" className="text-sm font-medium leading-none">
										Full Name
									</label>
									<Input
										id="fullName"
										name="fullName"
										placeholder={role === "doctor" ? "Dr. John Doe" : "Clinic Admin"}
										required={!isLogin}
									/>
								</div>
							</div>
						)}
						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium leading-none">
								Email
							</label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="m@example.com"
								required
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label htmlFor="password" className="text-sm font-medium leading-none">
									Password
								</label>
							</div>
							<Input id="password" name="password" type="password" required minLength={6} />
						</div>

						{error && (
							<div className="text-sm font-medium text-destructive text-red-500">
								{error}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={loading}>
							{loading
								? "Please wait..."
								: isLogin
									? "Log in"
									: "Sign up"
							}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center border-t p-4">
					<p className="text-sm text-muted-foreground text-center">
						{isLogin ? "Don't have an account? " : "Already have an account? "}
						<button
							type="button"
							onClick={() => {
								setIsLogin(!isLogin);
								setError(null);
							}}
							className="text-primary hover:underline font-medium"
						>
							{isLogin ? "Sign up" : "Log in"}
						</button>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
