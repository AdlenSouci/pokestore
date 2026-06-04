import { authTokenRef } from '../auth/tokenRef';
import { getApiBaseUrl } from '../config/api';

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  if (path.startsWith('http')) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  const t = authTokenRef.current;
  if (t) {
    headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j?.message && typeof j.message === 'string') {
        msg = j.message;
      } else if (text) {
        msg = text.slice(0, 200);
      }
    } catch {
      if (text) msg = text.slice(0, 200);
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}
