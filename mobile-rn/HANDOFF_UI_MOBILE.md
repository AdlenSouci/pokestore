# Passation — UI app mobile (React Native / Expo)



## Contexte actuel



- Projet : **`mobile-rn/`** — **Expo** + **React Navigation** (stack native), **sans WebView** pour le cœur de l’app.

- L’app appelle directement l’**API NestJS** (`GET /api/cards`, `GET /api/cards/meta`) via `EXPO_PUBLIC_API_URL` (ex. `http://192.168.x.x:3000/api`).

- Si `EXPO_PUBLIC_API_URL` est absent : **émulateur Android** → `http://10.0.2.2:3000/api` ; **simulateur iOS** → `http://127.0.0.1:3000/api`. Sur **téléphone physique**, définir l’URL avec l’**IPv4 du PC** sur le LAN.

- Fichiers utiles : `src/config/api.ts`, `src/api/cards.ts`, écrans dans `src/screens/`.



**Écrans livrés (MVP) :** accueil → boutique (grille, recherche, filtres série/set, pagination) → détail carte.



---



## Objectif produit (suite)



- Panier, auth (JWT / OAuth), commandes — mêmes endpoints que le web, UI native.

- Splash + icône Expo, Safe Area fine sur les écrans complexes.

- Optionnel : `FlashList`, thème partagé, toasts.



---



## Checklist rapide



- [ ] Brancher **auth** + panier sur les routes `/api/...` existantes.

- [ ] Tester sur **2 tailles d’écran** + appareil réel (URL API LAN obligatoire).

- [ ] Ne pas committer de secrets (`.env` local uniquement).

- [ ] Corriger **inscription + connexion mobile** (actuellement non fonctionnelles selon QA).

- [ ] Aligner le rendu **effets carte** mobile sur le frontend web (effet autour de la carte, pas un fond carré global).

- [ ] Vérifier le **tilt carte** (inclinaison au toucher) + compatibilité scroll.



---



## Bloquants à traiter en priorité



### 1) Auth mobile cassée (critique)

- Symptôme : création de compte et login ne fonctionnent pas sur mobile.

- Attendu : même flux que le frontend web (register -> login -> token stocké -> session persistée -> logout).

- À vérifier :
  - URL API réellement appelée depuis mobile (`EXPO_PUBLIC_API_URL` + fallback).
  - Routes exactes backend (ex: `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`).
  - Format payload envoyé (email/password), headers `Content-Type`, gestion erreurs 4xx/5xx.
  - Stockage token côté mobile (`AsyncStorage`) + injection `Authorization: Bearer ...`.
  - Restauration session au relancement de l’app.

- Critères d’acceptation :
  - Un nouvel utilisateur peut s’inscrire depuis mobile.
  - L’utilisateur peut se connecter, fermer/rouvrir l’app, rester connecté.
  - Logout invalide la session locale.
  - Les appels protégés (panier, profil, commandes) passent avec token.



### 2) Effets de carte (par type) comme le web

- Contexte : le frontend web utilise `CardDetailModal` + `TestEffect` (canvas).

- Attendu mobile : effet visible **autour de la carte** sur le détail, selon le type (`water`, `fire`, `electric`, `psy`, `flying`, `dragon`).

- Points de contrôle :
  - Mapping type backend -> effet (`src/lib/cardTypeToEffect.ts`) avec aliases réels de la DB.
  - Positionnement : couche effet sous la carte dans la zone carte (pas plein écran “déconnecté”).
  - Intensité/opacity pour éviter “on ne voit rien”.
  - Android/iOS: transparence WebView + perf.



### 3) Interaction carte détail

- Tilt tactile déjà ajouté (`TiltableCard`) : vérifier ressenti “comme le web”.

- Vérifier que le scroll de la page reste utilisable (pas de blocage gestuel gênant).

- Vérifier recadrage image (`contain`) : pas de coupe des bords.



---



## Références



| Fichier | Rôle |

|--------|------|

| `App.tsx` | `NavigationContainer` + stack |

| `src/config/api.ts` | Base URL API |

| `src/screens/CardDetailScreen.tsx` | Détail carte + zone effet + tilt |

| `src/components/effects/TypeEffectWebView.tsx` | Effets canvas en WebView |

| `src/components/effects/canvasEffectHtml.ts` | Logique visuelle des effets par type |

| `src/components/TiltableCard.tsx` | Inclinaison 3D au toucher |

| `frontend/src/lib/api.ts` | Équivalent web (résolution hôte navigateur) |

| `frontend/src/components/CardDetailModal.tsx` | Référence UX visuelle à reproduire |

| `frontend/src/components/TestEffect.tsx` | Référence animation type (canvas) |

| `backend/src/main.ts` | Port 3000, CORS, préfixe `/api` |

| Swagger | `http://<PC>:3000/api/docs` |



*Stack : Expo SDK ~54, React 19, React Navigation 7.*


