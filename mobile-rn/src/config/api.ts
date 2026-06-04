import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PATH = '/api';

/** Extrait l’hôte LAN depuis Expo (Expo Go / dev) pour pointer vers le PC sans `.env`. */
function apiBaseFromExpoDevHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | null)?.extra?.expoClient
      ?.hostUri;
  const legacy = (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;
  const raw = hostUri ?? legacy;
  if (!raw || typeof raw !== 'string') {
    return null;
  }
  const host = raw.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }
  return `http://${host}:3000${DEFAULT_PATH}`;
}

/**
 * URL de base API — même contrat que `frontend/src/lib/api.ts` (`VITE_API_URL`).
 * Priorité : `EXPO_PUBLIC_API_URL` → IP déduite du serveur Expo (LAN) → émulateur / simulateur.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  const fromExpo = apiBaseFromExpoDevHost();
  if (fromExpo) {
    return fromExpo;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:3000${DEFAULT_PATH}`;
  }
  return `http://127.0.0.1:3000${DEFAULT_PATH}`;
}
