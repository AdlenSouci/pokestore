import { buildUrl } from './fetchHelpers';
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

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { message?: string };
    return j.message ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const url = buildUrl('/auth/login');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<AuthResponse>;
}

export async function registerRequest(
  email: string,
  password: string,
  name: string,
): Promise<AuthResponse> {
  const url = buildUrl('/auth/register');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<AuthResponse>;
}

export async function fetchProfile(): Promise<User> {
  const url = buildUrl('/auth/profile');
  const headers: Record<string, string> = { Accept: 'application/json' };
  const t = authTokenRef.current;
  if (!t) throw new Error('Non connecté');
  headers.Authorization = `Bearer ${t}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<User>;
}

/** URL OAuth Google — même endpoint que le front (`auth.service.loginWithGoogle`). */
export function getGoogleAuthUrl(): string {
  return buildUrl('/auth/google');
}
