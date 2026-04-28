"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { removeDoctor } from "./remove-doctor-action";

export function RemoveDoctorButton({ clinicId, userId, doctorName }: { clinicId: string, userId: string, doctorName: string }) {
	const [isLoading, setIsLoading] = useState(false);

	async function handleRemove() {
		if (!window.confirm(`Are you sure you want to remove ${doctorName}'s access to this clinic?`)) {
			return;
		}

		setIsLoading(true);
		const result = await removeDoctor(clinicId, userId);
		setIsLoading(false);

		if (result.error) {
			alert(result.error);
		}
	}

	return (
		<Button 
			variant="ghost" 
			size="sm" 
			onClick={handleRemove} 
			disabled={isLoading}
			className="text-red-600 hover:text-red-700 hover:bg-red-50"
		>
			{isLoading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
		</Button>
	);
}
