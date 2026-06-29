/**
 * Lien direct du fichier APK Android (pas la page expo.dev).
 * Après `eas build --platform android --profile preview` :
 *   eas build:view <build-id> --json  →  artifacts.buildUrl
 * Puis redéploie le frontend. Le lien EAS expire ~14 jours après le build.
 */
export const ANDROID_APK_URL =
  'https://expo.dev/artifacts/eas/N0gEspkRmGX7L8i3sabkI5DbaD1-2VgFuQsqODzhEw4.apk';

export const ANDROID_APK_LABEL = 'Télécharger l’application';
