function resolveServerBaseUrl() {
	return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';
}

function resolvePublicBaseUrl() {
	return process.env.NEXT_PUBLIC_BACKEND_URL || resolveServerBaseUrl();
}

export function getBaseUrl(): string {
	if (typeof window === 'undefined') {
		return resolveServerBaseUrl();
	}

	return resolvePublicBaseUrl();
}

export function getServerBaseUrl(): string {
	if (typeof window !== 'undefined') {
		throw new Error('getServerBaseUrl can only be called on the server');
	}

	return resolveServerBaseUrl();
}


