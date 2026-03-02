import type { NextApiRequest, NextApiResponse } from 'next';

const expiredCookie = (name: string) =>
  `${name}=deleted; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'fail', data: { message: 'Method not allowed' } });
  }

  res.setHeader('Set-Cookie', [expiredCookie('amb_access_token'), expiredCookie('amb_login_token')]);
  return res.status(200).json({ status: 'success' });
}
