import { getApiBaseUrl } from '../config/api';

export function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  if (path.startsWith('http')) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
