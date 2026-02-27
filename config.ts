const DEFAULT_BASE_URL = 'http://localhost:3003/api/v1';
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BASE_URL;

function resolveServerBaseUrl() {
	return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BASE_URL;
}

export function getBaseUrl(): string {
	if (typeof window === 'undefined') {
		return resolveServerBaseUrl();
	}

	return PUBLIC_BASE_URL;
}

export function getServerBaseUrl(): string {
	if (typeof window !== 'undefined') {
		throw new Error('getServerBaseUrl can only be called on the server');
	}

	return resolveServerBaseUrl();
}


