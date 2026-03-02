import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerBaseUrl } from '@/config';

const ONE_DAY_SECONDS = 60 * 60 * 24;

type CookieOptions = {
  maxAgeSeconds?: number;
  secure?: boolean;
};

function createCookie(name: string, value: string, options: CookieOptions = {}) {
  const { maxAgeSeconds = ONE_DAY_SECONDS, secure = false } = options;
  const encoded = encodeURIComponent(value);
  const parts = [
    `${name}=${encoded}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function resolveTokenValue(data: any, keys: string[]) {
  if (!data || typeof data !== 'object') return null;
  for (const key of keys) {
    const value = data?.[key];
    if (typeof value === 'string' && value) {
      return value;
    }
  }
  return null;
}

function isHttpsRequest(req: NextApiRequest) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  if (forwardedProto) {
    const value = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
    if (value) {
      return value.split(',')[0].trim().toLowerCase() === 'https';
    }
  }

  const forwardedHeader = req.headers['forwarded'];
  if (forwardedHeader) {
    const value = Array.isArray(forwardedHeader) ? forwardedHeader[0] : forwardedHeader;
    if (value && value.toLowerCase().includes('proto=https')) {
      return true;
    }
  }

  return Boolean((req.socket as any)?.encrypted);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'fail', data: { message: 'Method not allowed' } });
  }

  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({ status: 'fail', data: { message: 'Email and password are required.' } });
  }

  const backendUrl = getServerBaseUrl();

  if (!backendUrl) {
    return res.status(500).json({ status: 'fail', data: { message: 'BACKEND_URL is not configured.' } });
  }

  try {
    const response = await fetch(`${backendUrl}/auth/signin/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const body = await response.json().catch(() => ({}));
    const statusCode = response.status || (body?.status === 'fail' ? 400 : 200);
    const secureCookiesEnabled = isHttpsRequest(req) || process.env.FORCE_SECURE_COOKIES === 'true';

    if (response.ok && body?.data) {
      const cookies: string[] = [];
      const accessToken = resolveTokenValue(body.data, ['accessToken', 'access_token', 'access-token']);
      const loginToken = resolveTokenValue(body.data, ['loginToken', 'login_token', 'login-token']);

      if (accessToken) {
        cookies.push(createCookie('amb_access_token', accessToken, { secure: secureCookiesEnabled }));
      }
      if (loginToken) {
        cookies.push(createCookie('amb_login_token', loginToken, { secure: secureCookiesEnabled }));
      }
      if (cookies.length) {
        res.setHeader('Set-Cookie', cookies);
      }
    }

    return res.status(statusCode).json(body);
  } catch (error: any) {
    return res
      .status(502)
      .json({ status: 'fail', data: { message: error?.message || 'Unable to reach backend.' } });
  }
}
