const PROD_API_URL = 'https://pokestore-api-btz1.onrender.com/api';
const PROD_WEB_URL = 'https://pokestore-hazel.vercel.app';

/** URL web pour le retour Stripe après paiement. */
export function getWebReturnUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_WEB_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return PROD_WEB_URL;
}

/** URL de base API — alignée sur `VITE_API_URL` du frontend (prod Render). */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return PROD_API_URL;
}
