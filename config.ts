const BACKEND_BASE_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL ||'';

export function getBaseUrl(): string {
	if (typeof window === 'undefined') {
		return BACKEND_BASE_URL;
	}

	return process.env.NEXT_PUBLIC_BACKEND_URL || BACKEND_BASE_URL || '';
}

export function getServerBaseUrl(): string {
	if (typeof window !== 'undefined') {
		throw new Error('getServerBaseUrl can only be called on the server');
	}

	return BACKEND_BASE_URL;
}


