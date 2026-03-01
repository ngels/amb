import { resolveBackendUrl } from '@/src/services/httpClient';

export async function postJson(path: string, payload: any) {
  // Build headers and include stored tokens when available (client-side)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    if (typeof window !== 'undefined') {
      // Prefer accessToken (JWT) over loginToken
      const storedAccess = localStorage.getItem('accessToken');
      if (storedAccess) {
        headers['Authorization'] = `Bearer ${storedAccess}`;
      } else {
        // Fallback to loginToken
        const storedLogin = localStorage.getItem('loginToken');
        if (storedLogin) headers['x-login-token'] = storedLogin;
      }
    }
  } catch (e) {
    // ignore localStorage errors
  }

  const res = await fetch(resolveBackendUrl(path), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  // Treat 2xx (including 201) as success. For non-OK responses, try to parse
  // the JSON body and throw it so callers can inspect `body.status` and
  // `body.data.message`. If the response isn't JSON, throw a generic Error.
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await res.json();
      console.log(`Error Response: ${res.status} -`, body);
      throw body;
    } else {
      const text = await res.text();
      console.log(`Error Response: ${res.status} - ${text}`);
      throw new Error(`Request failed: ${res.status} ${text}`);
    }
  }

  // Parse successful response
  const body = await res.json();

  // If signin returned tokens, store them (client-side only)
  try {
    if (typeof window !== 'undefined' && body?.data) {
      const access = body.data.accessToken || body.data.access_token || null;
      const login = body.data.loginToken || body.data.login_token || null;
      if (access) localStorage.setItem('accessToken', access);
      if (login) localStorage.setItem('loginToken', login);
    }
  } catch (e) {
    // ignore storage errors
  }

  return body;
}


export async function getJson(path: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    if (typeof window !== 'undefined') {
      const storedAccess = localStorage.getItem('accessToken');
      if (storedAccess) {
        headers['Authorization'] = `Bearer ${storedAccess}`;
      } else {
        const storedLogin = localStorage.getItem('loginToken');
        if (storedLogin) headers['x-login-token'] = storedLogin;
      }
    }
  } catch (e) {
    // ignore localStorage errors
  }

  const res = await fetch(resolveBackendUrl(path), {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await res.json();
      console.log(`Error Response: ${res.status} -`, body);
      throw body;
    } else {
      const text = await res.text();
      console.log(`Error Response: ${res.status} - ${text}`);
      throw new Error(`Request failed: ${res.status} ${text}`);
    }
  }

  const body = await res.json();
  return body;
}

export async function signout() {
  let backendResponse: any = null;
  try {
    backendResponse = await getJson('/auth/signout');
  } catch (err) {
    backendResponse = err;
  }

  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // ignore cookie clear failures
  }

  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('loginToken');
      localStorage.removeItem('userPermissions');
      localStorage.removeItem('profileCompleteStatus');
    }
  } catch (e) {
    // ignore storage errors
  }

  return backendResponse;
}

