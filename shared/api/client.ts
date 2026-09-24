const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";

const API_BASE_REGEX = /\/$/;

class ApiError extends Error {
	constructor(
		public status: number,
		public message: string,
		public response?: Response,
	) {
		super(message);
		this.name = "ApiError";
	}
}

type FetchBackendResult = {
	response: Response | null;
	unreachable: boolean;
};

/** Server-side fetch to the Go API. `unreachable` is true when the backend cannot be contacted. */
async function fetchBackend(
	path: string,
	options?: RequestInit,
): Promise<FetchBackendResult> {
	const base = (API_BASE || "").replace(API_BASE_REGEX, "");
	const fullUrl = `${base}${path.startsWith("/") ? path : `/${path}`}`;

	try {
		return { response: await fetch(fullUrl, options), unreachable: false };
	} catch (error) {
		console.error(`Backend unreachable at ${fullUrl}:`, error);
		return { response: null, unreachable: true };
	}
}

async function apiRequest<T>(
	url: string,
	options?: RequestInit,
): Promise<T> {
	const base = (API_BASE || "").replace(API_BASE_REGEX, "");
	const fullUrl = `${base}${url}`;

	const response = await fetch(fullUrl, {
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
		...options,
	});

	if (!response.ok) {
		const message = await response.text().catch(() => "Unknown error");
		throw new ApiError(response.status, message, response);
	}

	return response.json();
}

export { ApiError, apiRequest, fetchBackend, API_BASE };
export type { FetchBackendResult };
