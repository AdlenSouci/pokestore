const DEFAULT_API_PORT = 3000;
const DEFAULT_API_PATH = '/api';

function defaultLocalApiUrl(): string {
  return `http://localhost:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`;
}

/** Déduit l’URL de l’API quand le front est servi depuis l’émulateur ou le réseau local (WebView, téléphone). */
function browserDefaultApiUrl(): string {
  if (typeof window === 'undefined') {
    return defaultLocalApiUrl();
  }
  const { hostname } = window.location;
  if (hostname === '10.0.2.2') {
    return `http://10.0.2.2:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`;
  }
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return `http://${hostname}:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`;
  }
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) && hostname !== '10.0.2.2') {
    return `http://${hostname}:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`;
  }
  return defaultLocalApiUrl();
}

function isNativeCapacitorApp(): boolean {
  const capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor;
  return !!capacitor?.isNativePlatform?.();
}

function isReactNativeWebView(): boolean {
  return typeof window !== 'undefined' && !!(window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView;
}

/**
 * Remplace localhost par l’hôte de la page quand on est dans un WebView / émulateur / LAN,
 * pour que les appels API atteignent le PC qui sert aussi le backend.
 */
function normalizeApiUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) {
      return url.replace(/\/$/, '');
    }

    const pageHost =
      typeof window !== 'undefined' ? window.location.hostname : '';

    const mustRewriteLocalhost =
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
      (isNativeCapacitorApp() ||
        isReactNativeWebView() ||
        pageHost === '10.0.2.2' ||
        /^192\.168\.\d{1,3}\.\d{1,3}$/.test(pageHost));

    if (mustRewriteLocalhost) {
      if (pageHost && pageHost !== 'localhost' && pageHost !== '127.0.0.1') {
        parsed.hostname = pageHost;
      } else {
        parsed.hostname = '10.0.2.2';
      }
    }

    return parsed.toString().replace(/\/$/, '');
  } catch {
    return url.replace(/\/$/, '');
  }
}

const rawFromEnv = import.meta.env.VITE_API_URL as string | undefined;
const base =
  rawFromEnv && rawFromEnv.trim() !== ''
    ? rawFromEnv
    : browserDefaultApiUrl();

export const API_URL = normalizeApiUrl(base);
