import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerBaseUrl } from '@/config';

const isProduction = process.env.NODE_ENV === 'production';
const ONE_DAY_SECONDS = 60 * 60 * 24;

function createCookie(name: string, value: string, maxAgeSeconds = ONE_DAY_SECONDS) {
  const encoded = encodeURIComponent(value);
  const parts = [
    `${name}=${encoded}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (isProduction) {
    parts.push('Secure');
  }
  return parts.join('; ');
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

    if (response.ok && body?.data) {
      const cookies: string[] = [];
      if (typeof body.data.accessToken === 'string' && body.data.accessToken) {
        cookies.push(createCookie('amb_access_token', body.data.accessToken));
      }
      if (typeof body.data.loginToken === 'string' && body.data.loginToken) {
        cookies.push(createCookie('amb_login_token', body.data.loginToken));
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
