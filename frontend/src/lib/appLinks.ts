/** URL publique du site — le QR doit être une adresse complète pour le scan mobile. */
const SITE_URL = 'https://pokestore-hazel.vercel.app';

/**
 * APK hébergée sur le site (frontend/public/downloads/pokestore.apk).
 * Le client ne voit jamais expo.dev : scan → téléchargement → installation.
 *
 * Après un nouveau build Android : télécharge l’artifact EAS et remplace
 * frontend/public/downloads/pokestore.apk, puis redéploie le frontend.
 */
export const ANDROID_APK_URL = `${SITE_URL}/downloads/pokestore.apk`;

export const ANDROID_APK_LABEL = 'Télécharger l’application';
