function normalizeBaseUrl(url: string | undefined | null) {
	if (!url) return '';
	return url.endsWith('/') ? url.slice(0, -1) : url;
}

function resolveServerBaseUrl() {
	const normalized = normalizeBaseUrl(process.env.BACKEND_URL);
	if (!normalized) {
		throw new Error('BACKEND_URL is not configured. It must point to the internal backend origin.');
	}
	return normalized;
}

function resolvePublicBaseUrl() {
	return '/api/backend';
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


