export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : 'https://adk-webapp-production.up.railway.app/api');

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('adk_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = cleanBase.endsWith('/api') && cleanPath.startsWith('/api')
    ? `${cleanBase}${cleanPath.substring(4)}`
    : `${cleanBase}${cleanPath}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (netErr) {
    throw new Error(
      `Network error: Could not reach the server at ${url}. (${netErr.message})`
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data;
}
