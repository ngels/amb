import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerBaseUrl } from '@/config';

const FORWARDED_HEADERS = ['authorization', 'x-login-token', 'content-type', 'accept'];

function buildTargetUrl(req: NextApiRequest, pathParam: string | string[] | undefined, backendBase: string) {
  const segments = Array.isArray(pathParam)
    ? pathParam
    : pathParam
      ? [pathParam]
      : [];

  const normalizedBase = backendBase.replace(/\/$/, '');
  const pathSuffix = segments.length > 0 ? `/${segments.join('/')}` : '';
  const queryIndex = req.url?.indexOf('?') ?? -1;
  const query = queryIndex >= 0 ? req.url?.slice(queryIndex) : '';

  return `${normalizedBase}${pathSuffix}${query || ''}`;
}

function collectHeaders(req: NextApiRequest) {
  const headers = new Headers();

  FORWARDED_HEADERS.forEach((key) => {
    const value = req.headers[key];
    if (!value) return;
    if (Array.isArray(value)) {
      headers.set(key, value[0]);
    } else {
      headers.set(key, value);
    }
  });

  return headers;
}

function serializeBody(req: NextApiRequest) {
  const method = req.method || 'GET';
  if (method === 'GET' || method === 'HEAD') {
    return undefined;
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return undefined;
  }

  if (typeof req.body === 'string') {
    return req.body;
  }

  return JSON.stringify(req.body);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendBase = getServerBaseUrl();

  if (!backendBase) {
    return res
      .status(500)
      .json({ status: 'fail', data: { message: 'BACKEND_URL is not configured on the server.' } });
  }

  try {
    const targetUrl = buildTargetUrl(req, req.query.path, backendBase);
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: collectHeaders(req),
      body: serializeBody(req),
      cache: 'no-store',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-length') return;
      res.setHeader(key, value);
    });
    res.status(response.status).send(buffer);
  } catch (error: any) {
    res
      .status(502)
      .json({ status: 'fail', data: { message: error?.message || 'Proxy request failed.' } });
  }
}
