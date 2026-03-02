import { getServerBaseUrl } from '@/config';

function ensureLeadingSlash(path: string) {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
}

function normalizeBaseUrl(url: string) {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function resolveBackendUrl(path: string): string {
  const normalizedPath = ensureLeadingSlash(path);

  if (typeof window === 'undefined') {
    const serverBase = normalizeBaseUrl(getServerBaseUrl());
    if (!serverBase) {
      throw new Error('BACKEND_URL is not configured.');
    }
    return `${serverBase}${normalizedPath}`;
  }

  return `/api/backend${normalizedPath}`;
}
