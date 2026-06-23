import { getApiBaseUrl } from '../config/api';

const DEFAULT_TIMEOUT_MS = 45_000;

export function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  if (path.startsWith('http')) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** fetch avec timeout — évite le spinner infini si l'API Render ne répond pas. */
export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        'Le serveur met trop de temps à répondre. Réessaie dans quelques secondes (Render peut être en train de démarrer).',
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function parseApiError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(j.message)) {
      return j.message.join(', ');
    }
    if (typeof j.message === 'string') {
      return j.message;
    }
  } catch {
    // ignore
  }
  return `Erreur serveur (${res.status})`;
}
