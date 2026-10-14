"use client";

import { deleteClinic } from "@/app/(app)/clinic/actions";
import { Button } from "@/shared/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteClinicButton({ clinicName }: { clinicName: string }) {
	const [isLoading, setIsLoading] = useState(false);

	async function handleDelete() {
		if (
			!window.confirm(
				`Delete "${clinicName}"? This removes the clinic and all staff access in the app. Patient data on connected devices is not deleted.`,
			)
		) {
			return;
		}

		setIsLoading(true);
		const result = await deleteClinic(clinicName);
		setIsLoading(false);

		if (result.error) {
			alert(result.error);
		}
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleDelete}
			disabled={isLoading}
			className="text-red-600 hover:bg-red-50 hover:text-red-700"
			title="Delete clinic"
		>
			{isLoading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
			<span className="sr-only">Delete clinic</span>
		</Button>
	);
}
