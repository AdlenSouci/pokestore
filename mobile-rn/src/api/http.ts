import { authTokenRef } from '../auth/tokenRef';
import { buildUrl, fetchWithTimeout, parseApiError } from '../services/fetchHelpers';

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
  const res = await fetchWithTimeout(url, { ...init, headers });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<T>;
}
