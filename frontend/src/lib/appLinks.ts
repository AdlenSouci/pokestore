/**
 * Page Expo (build ou projet) — QR + lien d’installation comme sur expo.dev.
 * À mettre à jour sur Vercel après chaque nouveau `eas build`.
 */
export function getExpoAppUrl(): string {
  const fromEnv = import.meta.env.VITE_EXPO_APP_URL as string | undefined;
  const trimmed = fromEnv?.trim();
  if (trimmed) {
    return trimmed;
  }
  return 'https://expo.dev/accounts/adlens/projects/mobile-rn/builds/e28f820b-a200-4b08-ad42-af1c327f9ff8';
}

export const EXPO_APP_LABEL = 'Ouvrir sur Expo';
