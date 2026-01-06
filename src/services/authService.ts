import { BASE_URL } from '@/config';

export async function postJson(path: string, payload: any) {
  console.log(`POST Request to: ${BASE_URL}${path} with payload:`, payload);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
      // Throw the parsed body (object) so callers can access `.data.message`.
      throw body;
    } else {
      const text = await res.text();
      console.log(`Error Response: ${res.status} - ${text}`);
      throw new Error(`Request failed: ${res.status} ${text}`);
    }
  }

  return res.json();
}
