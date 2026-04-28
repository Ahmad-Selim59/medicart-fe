"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { UserPlus, Loader2 } from "lucide-react";
import { inviteDoctor } from "./invite-doctor-action";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";

export function InviteDoctorButton({ clinicId }: { clinicId: string }) {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleInvite() {
		if (!email) return;
		setError(null);
		setIsLoading(true);
		
		const result = await inviteDoctor(clinicId, email);
		
		setIsLoading(false);
		if (result.error) {
			setError(result.error);
		} else {
			setIsOpen(false);
			setEmail("");
			setError(null);
		}
	}

	return (
		<>
			<Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
				<UserPlus className="size-4 mr-2" />
				Add Doctor
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent onClose={() => setIsOpen(false)}>
				<DialogHeader>
					<DialogTitle>Add Doctor to Clinic</DialogTitle>
					<DialogDescription>
						Enter the email address of the doctor you want to add. They must already have an account.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<Input
						placeholder="doctor@example.com"
						type="email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							if (error) setError(null);
						}}
					/>
				</div>
				{error && (
					<div className="text-red-600 text-sm mb-4 px-1">{error}</div>
				)}
				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
					<Button onClick={handleInvite} disabled={isLoading || !email}>
						{isLoading ? <Loader2 className="size-4 animate-spin" /> : "Add Doctor"}
					</Button>
				</DialogFooter>
			</DialogContent>
			</Dialog>
		</>
	);
}
