const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8081";

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

export { ApiError, apiRequest };
