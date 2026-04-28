"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Plus, UserPlus, X, Loader2 } from "lucide-react";
import { addClinic } from "./actions";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";

export function AddClinicButton() {
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [clinicName, setClinicName] = useState("");
	const [doctorEmails, setDoctorEmails] = useState<string[]>([""]);
	const [error, setError] = useState<string | null>(null);

	const handleAddEmail = () => setDoctorEmails([...doctorEmails, ""]);
	const handleRemoveEmail = (index: number) => {
		setDoctorEmails(doctorEmails.filter((_, i) => i !== index));
	};
	const handleEmailChange = (index: number, value: string) => {
		const newEmails = [...doctorEmails];
		newEmails[index] = value;
		setDoctorEmails(newEmails);
		if (error) setError(null);
	};

	const handleSubmit = async () => {
		if (!clinicName) {
			setError("Please enter a clinic name.");
			return;
		}

		setError(null);
		setLoading(true);
		const res = await addClinic(clinicName, doctorEmails.filter(e => e.trim() !== ""));
		setLoading(false);

		if (res?.error) {
			setError(res.error);
		} else {
			setIsOpen(false);
			resetForm();
		}
	};

	const resetForm = () => {
		setClinicName("");
		setDoctorEmails([""]);
		setError(null);
	};

	return (
		<>
			<Button size="sm" className="shrink-0" onClick={() => setIsOpen(true)}>
				<Plus className="size-4" />
				<span className="hidden sm:inline">Add Clinic</span>
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-md" onClose={() => setIsOpen(false)}>
					<DialogHeader>
						<DialogTitle>Add New Clinic</DialogTitle>
						<DialogDescription>
							Enter the clinic ID and invite doctors to join. Doctors must already have an account.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Clinic Name / ID</label>
							<Input
								placeholder="e.g. medicart_clinic_1"
								value={clinicName}
								onChange={(e) => setClinicName(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center justify-between">
								Invite Doctors (Optional)
								<button 
									type="button" 
									onClick={handleAddEmail}
									className="text-xs text-primary hover:underline flex items-center"
								>
									<UserPlus className="size-3 mr-1" /> Add another
								</button>
							</label>
							<div className="space-y-2 max-h-40 overflow-y-auto pr-1">
								{doctorEmails.map((email, index) => (
									<div key={index} className="flex gap-2">
										<Input
											placeholder="doctor@example.com"
											type="email"
											value={email}
											onChange={(e) => handleEmailChange(index, e.target.value)}
											className="flex-1"
										/>
										{doctorEmails.length > 1 && (
											<Button 
												variant="ghost" 
												size="icon" 
												onClick={() => handleRemoveEmail(index)}
												className="shrink-0"
											>
												<X className="size-4" />
											</Button>
										)}
									</div>
								))}
							</div>
						</div>
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm mb-4 animate-in fade-in slide-in-from-top-1">
							{error}
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
							Cancel
						</Button>
						<Button onClick={handleSubmit} disabled={loading}>
							{loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
							Create Clinic
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
