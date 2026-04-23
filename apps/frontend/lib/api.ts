const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function getApiUrl() {
	return API_URL
}

export async function apiFetch<T>(
	path: string,
	options?: RequestInit,
): Promise<T> {
	const response = await fetch(`${API_URL}${path}`, {
		credentials: 'include',
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options?.headers || {}),
		},
	})

	if (!response.ok) {
		let message = 'Request failed'

		try {
			const errorData = await response.json()
			if (errorData?.message) message = errorData.message
		} catch {
			// Ignore JSON parse errors
		}

		throw new Error(message)
	}

	return response.json() as Promise<T>
}
