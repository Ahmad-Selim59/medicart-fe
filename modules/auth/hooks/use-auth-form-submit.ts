"use client";

import { useCallback, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";

type AuthActionResult = { error?: string; success?: boolean } | void | undefined;

interface UseAuthFormSubmitOptions {
	onSuccess?: (result: AuthActionResult) => void;
	validate?: (formData: FormData) => string | null;
}

export function useAuthFormSubmit(
	action: (formData: FormData) => Promise<AuthActionResult>,
	options?: UseAuthFormSubmitOptions,
) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = useCallback(
		async (
			event: FormEvent<HTMLFormElement>,
			prepareFormData?: (formData: FormData) => void,
		) => {
			event.preventDefault();

			const formData = new FormData(event.currentTarget);
			prepareFormData?.(formData);

			flushSync(() => {
				setLoading(true);
				setError(null);
			});

			if (options?.validate) {
				const validationError = options.validate(formData);
				if (validationError) {
					setError(validationError);
					setLoading(false);
					return;
				}
			}

			try {
				const result = await action(formData);

				if (result?.error) {
					setError(result.error);
					setLoading(false);
					return;
				}

				options?.onSuccess?.(result);
				setLoading(false);
			} catch {
				// Server actions call redirect() on success, which throws — keep loading visible.
			}
		},
		[action, options],
	);

	return { loading, error, setError, setLoading, handleSubmit };
}
