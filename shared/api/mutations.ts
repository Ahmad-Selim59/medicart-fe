import type { CameraControlRequest, CameraControlResponse } from "@/shared/types/api";

import { apiRequest } from "./client";

// Camera control mutation
export function cameraControlMutation() {
	return {
		mutationFn: (command: string) =>
			apiRequest<CameraControlResponse>("/api/camera/control", {
				method: "POST",
				body: JSON.stringify({ command } as CameraControlRequest),
			}),
	};
}

// Refresh data mutation
export function refreshDataMutation(clinic: string, patient: string) {
	return {
		mutationFn: () =>
			apiRequest(`/api/clinic/${clinic}/patient/${patient}/data`),
		onSuccess: () => {
			// Invalidate related queries
			// This will be handled by the QueryClient in the component
		},
	};
}
