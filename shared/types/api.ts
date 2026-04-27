export interface RecordEntry {
	timestamp: string;
	patient_name?: string;
	clinic_name?: string;
	[k: string]: unknown;
}

export interface SensorData {
	type: string;
	[k: string]: unknown;
}

export interface HeartRateData {
	type: "data";
	pr: number; // Pulse Rate
	spo2: number; // Oxygen Saturation
	timestamp?: string;
}

export interface HeartRateStatus {
	type: "status";
	msg: string;
}

export interface BloodPressureResult {
	type: "result";
	sys: number; // Systolic
	dia: number; // Diastolic
	map: number; // Mean Arterial Pressure
	pr: number; // Pulse Rate
	irr: boolean; // Irregular heartbeat
	timestamp?: string;
}

export interface BloodPressureCuff {
	type: "cuff_update";
	cuff_pressure: number;
}

export interface BloodGlucoseData {
	type: "data";
	glu: number; // Glucose level (mg/dL)
	timestamp?: string;
}

export interface BodyTemperatureData {
	type: "data";
	temp: number; // Temperature (Celsius)
	timestamp?: string;
}

export interface StethoscopeStream {
	type: "stream";
	stream_type: "audio" | "heartrate";
	data?: number[]; // Array of int16 (if audio)
	value?: number; // Pulse rate (if heartrate)
}

export interface CameraControlRequest {
	command: string;
}

export interface CameraControlResponse {
	status: "ok";
}

export interface IngestRequest {
	patient_name: string;
	clinic_name: string;
	data: Record<string, unknown>;
}

export type PatientDataResponse = Record<string, RecordEntry[]>;
export type ClinicsResponse = string[];
export type PatientsResponse = string[];

export interface Clinic {
	id: string;
	name: string;
	address: string;
	phone: string;
	email: string;
	website: string;
	action: string;
	patientCount: number;
	status: "active" | "inactive";
}

export interface Patient {
	id: string;
	clinicId: string;
	name: string;
	gender: string;
	age: number;
	status: "stable" | "critical" | "warning";
	action: string;
	lastChecked: string;
	data: {
		heartRate: HeartRateData[];
		bloodPressure: BloodPressureResult[];
		cuffPressure?: BloodPressureCuff[];
		glucose: BloodGlucoseData[];
		temperature: BodyTemperatureData[];
		stethoscope: StethoscopeStream[];
	};
}
