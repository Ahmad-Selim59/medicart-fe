import type {
	Clinic,
	Patient,
	PatientDataResponse,
} from "@/shared/types/api";

import { apiRequest } from "./client";

// Clinic queries
export const clinicsQuery = {
	queryKey: ["clinics"],
	queryFn: () => apiRequest<Clinic[]>("/api/clinics"),
	staleTime: Infinity,
};

export function clinicByIdQuery(clinicId: string) {
	return {
		queryKey: ["clinic", clinicId],
		queryFn: () => apiRequest<Clinic>(`/api/clinic/${clinicId}`),
		enabled: !!clinicId,
	};
}

export function clinicPatientsQuery(clinicId: string) {
	return {
		queryKey: ["clinic", clinicId, "patients"],
		queryFn: () => apiRequest<Patient[]>(`/api/clinic/${clinicId}/patients`),
		enabled: !!clinicId,
	};
}

// Patient queries
export const patientsQuery = {
	queryKey: ["patients"],
	queryFn: () => apiRequest<Patient[]>("/api/patients"),
	staleTime: Infinity,
};

export function patientByIdQuery(patientId: string) {
	return {
		queryKey: ["patient", patientId],
		queryFn: () => apiRequest<Patient>(`/api/patient/${patientId}`),
		enabled: !!patientId,
	};
}

export function patientDataQuery(clinic: string, patient: string) {
	return {
		queryKey: ["patient", clinic, patient, "data"],
		queryFn: () =>
			apiRequest<PatientDataResponse>(
				`/api/clinic/${clinic}/patient/${patient}/data`,
			),
		enabled: !!(clinic && patient),
	};
}

export function patientCameraQuery(clinic: string, patient: string) {
	return {
		queryKey: ["patient", clinic, patient, "camera"],
		queryFn: async () => {
			const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8081";
			const response = await fetch(
				`${base}/api/clinic/${clinic}/patient/${patient}/camera`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch camera snapshot");
			}
			return response.blob();
		},
		enabled: !!(clinic && patient),
	};
}

// Dashboard queries
export const dashboardDataQuery = {
	queryKey: ["dashboard"],
	// We need to type this based on the backend response. Let's assume it returns any or we define a type later.
	queryFn: () => apiRequest<any>("/api/dashboard"),
	staleTime: 30 * 1000,
};
