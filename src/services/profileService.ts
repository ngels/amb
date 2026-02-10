import { BASE_URL } from '@/config';
import { getJson, postJson } from './authService';

export async function putJson(path: string, payload: any) {
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

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
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

export async function updateProfile(profileData: any) {
  return putJson('/profile', profileData);
}

export async function getProfile() {
  return getJson('/profile/me');
}

export async function getProfileById(profileId: string) {
  return getJson(`/profile/byId/${encodeURIComponent(profileId)}`);
}

export async function updateProfileCompletion(profileId: string, complete: number, feedback?: string | null) {
  return putJson('/profile/status', {
    profileId,
    complete,
    feedback: typeof feedback === 'string' ? feedback : null,
  });
}
