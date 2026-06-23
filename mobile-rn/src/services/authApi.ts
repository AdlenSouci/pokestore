import { buildUrl, fetchWithTimeout, parseApiError } from './fetchHelpers';
import { authTokenRef } from '../auth/tokenRef';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  hasPassword?: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const url = buildUrl('/auth/login');
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<AuthResponse>;
}

export async function registerRequest(
  email: string,
  password: string,
  name: string,
): Promise<AuthResponse> {
  const url = buildUrl('/auth/register');
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<AuthResponse>;
}

export async function fetchProfile(): Promise<User> {
  const url = buildUrl('/auth/profile');
  const headers: Record<string, string> = { Accept: 'application/json' };
  const t = authTokenRef.current;
  if (!t) throw new Error('Non connecté');
  headers.Authorization = `Bearer ${t}`;
  const res = await fetchWithTimeout(url, { headers });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<User>;
}

export function getGoogleAuthUrl(): string {
  return buildUrl('/auth/google');
}

/** Après OAuth Google : le backend redirige vers le site avec ?token=… */
export async function authFromGoogleToken(token: string): Promise<AuthResponse> {
  authTokenRef.current = token;
  const user = await fetchProfile();
  return { access_token: token, user };
}
