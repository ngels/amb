import type { NextApiRequest, NextApiResponse } from 'next';

const expiredCookie = (name: string, secure: boolean) =>
  `${name}=deleted; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;

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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'fail', data: { message: 'Method not allowed' } });
  }

  const secureCookiesEnabled = isHttpsRequest(req) || process.env.FORCE_SECURE_COOKIES === 'true';
  res.setHeader('Set-Cookie', [
    expiredCookie('amb_access_token', secureCookiesEnabled),
    expiredCookie('amb_login_token', secureCookiesEnabled),
  ]);
  return res.status(200).json({ status: 'success' });
}
