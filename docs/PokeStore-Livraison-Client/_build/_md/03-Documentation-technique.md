::: {align=center}
![](cahier-des-charges/images/logo.png){width=4.5cm}

**Documentation technique**

*Architecture, API, déploiement*

*Juin 2026 — Projet Ynov B3 DEV*
:::

\\newpage


---
lang: fr-FR
toc-title: "Table des matières"
---

**PokéStore est déjà en ligne.** Le client utilise le site, l’API et la base **sans rien installer**.  
Ce document décrit **comment c’est hébergé**, **comment ça fonctionne techniquement**, et **comment les tests ont été validés**.

Pour utiliser les applications → **Méthodologie utilisateur**.  
Pour la liste des fonctionnalités livrées → **Cahier des charges**.  
Pour reprendre le code (nouveau dev, dépôt privé) → **`docs/GUIDE_REPRISE_DEVELOPPEUR.md`**

# Environnement de production (déjà déployé)

| Élément | Où c’est | URL / accès |
|---------|----------|-------------|
| **Site web** | Vercel | https://pokestore-hazel.vercel.app |
| **API** | Render | https://pokestore-api-btz1.onrender.com/api |
| **Documentation API (Swagger)** | Render (intégré à l’API) | https://pokestore-api-btz1.onrender.com/api/docs |
| **Base de données** | Neon (PostgreSQL) | Hébergée en cloud — **déjà alimentée** (catalogue, comptes, commandes) |
| **Code source** | GitHub | https://github.com/AdlenSouci/pokestore |
| **App mobile** | APK Android | Fichier fourni par l’équipe (Expo EAS) |
| **App admin** | Electron (local) | Installateur `.exe` — rôle `ADMIN` uniquement |

**Le client n’a pas à copier de fichier `.env`.**  
Les clés secrètes (Stripe, JWT, Resend, `DATABASE_URL` Neon…) sont configurées dans les **tableaux de bord Vercel et Render** par l’équipe de développement. Elles ne se transmettent pas par email ni dans le livrable.

**Le client n’a pas à installer PostgreSQL.** La boutique en ligne lit et écrit directement dans la base Neon via l’API Render.

> **Cold start Render** : après inactivité, la première requête API peut prendre 30–60 s. C’est normal sur le plan gratuit.

# Architecture

```
┌──────────────┐  ┌──────────────┐  ┌─────────────────┐
│  Web React   │  │  Mobile Expo │  │ Admin Electron  │
└──────┬───────┘  └──────┬───────┘  └────────┬────────┘
       └─────────────────┼────────────────────┘
                         │ HTTPS REST
                         ▼
            ┌────────────────────────┐
            │  API NestJS (Render)   │
            └───────────┬────────────┘
                        │ Prisma
                        ▼
            ┌────────────────────────┐
            │  PostgreSQL (Neon)     │
            └────────────────────────┘
```

| Service | URL |
|---------|-----|
| Site web | https://pokestore-hazel.vercel.app |
| API | https://pokestore-api-btz1.onrender.com/api |
| Swagger (doc interactive) | https://pokestore-api-btz1.onrender.com/api/docs |
| Git | https://github.com/AdlenSouci/pokestore |

# Stack technique

| Dossier | Technologies |
|---------|--------------|
| `frontend/` | React 19, Vite, TypeScript, Tailwind |
| `backend/` | NestJS 11, Prisma 6, PostgreSQL |
| `mobile-rn/` | React Native, Expo 54 |
| `pokemon-electron/` | Electron Forge, React |

# Base de données

Fichier : `backend/prisma/schema.prisma`

| Modèle | Rôle |
|--------|------|
| `User` | Comptes clients (`USER`) ou administrateurs (`ADMIN`) |

**Rôles :**

| Rôle | Applications accessibles |
|------|-------------------------|
| `USER` | Site web + app mobile uniquement |
| `ADMIN` | Application admin Electron uniquement (login séparé : `/api/auth/admin/login`) |

Un compte **client** ne peut **pas** se connecter à l’admin. Un compte **admin** n’est pas destiné au parcours d’achat client.

| Modèle | Rôle |
|--------|------|
| `PokemonCard` | Catalogue |
| `Cart` / `CartItem` | Panier |
| `Order` / `OrderItem` | Commandes (`PENDING`, `PAID`, `CANCELLED`) |

# API — routes principales

**Documentation complète et testable en ligne :** https://pokestore-api-btz1.onrender.com/api/docs

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/auth/register` | — | Inscription |
| `POST /api/auth/login` | — | Connexion |
| `GET /api/cards` | — | Catalogue + filtres |
| `GET/POST/PATCH/DELETE /api/cart/*` | JWT | Panier |
| `POST /api/orders/checkout-session` | JWT | Paiement Stripe |
| `GET /api/orders` | JWT | Commandes |
| `POST /api/stripe/webhook` | Signature | Confirmation paiement |
| `POST /api/wallpaper/generate` | JWT | Fond d’écran IA mobile — **pas fait** |
| `POST /api/contact` | — | Formulaire contact |

# Paiement Stripe

```
Client → POST /api/orders/checkout-session → redirection Stripe
Stripe → webhook /api/stripe/webhook → commande PAID, panier vidé
Retour → /orders?payment=success
```

Fichiers : `backend/src/stripe/`, `backend/src/orders/`  
Variables : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`  
Test : carte `4242 4242 4242 4242`

# Emails — pourquoi Resend ?

| | |
|--|--|
| **Problème** | Render (plan gratuit) **bloque SMTP** port 587 → Gmail/Nodemailer ne partent pas en prod |
| **Solution** | **Resend** : envoi par **API HTTPS** (`resend.com`), compatible Render |
| **Utilisation** | Contact (`POST /api/contact`), confirmation de commande après paiement Stripe |
| **Config prod** | `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO` dans le dashboard Render |
| **En local** | SMTP classique possible (`MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` dans `.env`) |

::: {align=center}
![Réception email Gmail](./cahier-des-charges/images/gmail.jpg){width=14cm}
:::


::: {align=center}
![Paiement Stripe mobile](./cahier-des-charges/images/capture-mobile-stripe.jpg){width=14cm}
:::


# Fond d’écran IA (mobile) — pas fait

| | |
|--|--|
| **Statut** | Pas fait |
| **Pourquoi** | API Google Gemini : quota gratuit dépassé |
| **Dans le code** | Bouton dans l’app + route `/api/wallpaper/generate` (non abouti) |

# Sécurité

| Mesure | Détail |
|--------|--------|
| Mots de passe | bcrypt (10 rounds) |
| Sessions | JWT (`JWT_SECRET`) |
| Routes admin | `JwtAuthGuard` + `AdminGuard` (rôle `ADMIN` en base) |
| Login admin | **5 tentatives / 15 min / IP** ; même message d’erreur que login client (pas de fuite « compte USER ») |
| Clé client admin | `ADMIN_CLIENT_KEY` sur Render + header `X-Admin-Client-Key` depuis Electron (optionnel mais **recommandé en prod**) |
| Swagger | Routes admin **masquées** (`/auth/admin/login`, import/reprice cartes) |
| API | Helmet, rate limiting POST, captcha contact, signature webhook Stripe |

**Important :** la route `POST /api/auth/admin/login` est publique sur Internet (comme tout login). La protection repose sur : mot de passe fort, peu de comptes `ADMIN`, rate-limit, et clé `ADMIN_CLIENT_KEY` si activée — **pas** sur le fait de cacher le code Electron.

# Déploiement et secrets

## Où sont configurés les services ?

| Composant | Hébergeur | Configuration |
|-----------|-----------|---------------|
| Site web | **Vercel** | Variables `VITE_*` dans le dashboard Vercel |
| API | **Render** | Variables d’environnement dans le dashboard Render |
| Base de données | **Neon** | `DATABASE_URL` renseignée sur Render (connexion Prisma) |
| Emails prod | **Resend** | `RESEND_API_KEY`, `RESEND_FROM` sur Render |
| Paiement | **Stripe** | `STRIPE_SECRET_KEY`, webhook sur Render |
| APK mobile | **EAS (Expo)** | Build cloud, `EXPO_PUBLIC_API_URL` pointe vers Render |
| Admin desktop | **Local** | `.env` sur la machine admin + accès Neon |

Render (plan gratuit) : cold start ~30–60 s après inactivité.

## Variables d’environnement — qui fait quoi ?

| Fichier | À quoi ça sert |
|---------|----------------|
| `backend/.env.example` | **Modèle** pour un développeur qui clone le dépôt — **pas un fichier à remplir pour utiliser le site en ligne** |
| `frontend/.env.example` | Idem — en prod, `VITE_API_URL` est sur Vercel |
| `mobile-rn/.env.example` | Idem — l’APK livré pointe déjà vers l’API Render |

| Variable (prod) | Où elle est | Rôle |
|-----------------|-------------|------|
| `DATABASE_URL` | Dashboard **Render** | Connexion à **Neon** (base déjà en ligne) |
| `JWT_SECRET` | Render | Tokens de session |
| `FRONTEND_URL` | Render | CORS, OAuth Google, retours Stripe |
| `STRIPE_*` | Render + Stripe Dashboard | Paiement |
| `RESEND_API_KEY` | Render | Emails (contact + confirmation commande) |
| `VITE_API_URL` | **Vercel** | URL API pour le site web |

# Tests et qualité

## Où c’est documenté dans le livrable ?

| Type | Où dans les docs | Preuve |
|------|------------------|--------|
| **Fonctionnalités livrées** | Cahier des charges | Tableaux W-01, M-07, B-02… |
| **Utilisation** | Méthodologie utilisateur | Parcours pas à pas + recette |
| **Swagger, Jest, Playwright, Lighthouse** | **Ce document** (ci-dessous) + annexes cahier des charges |

## Swagger — documentation API interactive

Accessible **en ligne**, sans installation : https://pokestore-api-btz1.onrender.com/api/docs

Permet de voir toutes les routes, les paramètres et de tester l’API depuis le navigateur.

::: {align=center}
![Capture Swagger](./tests/e2e-06-swagger.png){width=14cm}
:::


## Tests unitaires backend (Jest)

| | |
|--|--|
| **Objectif** | Vérifier la logique métier (services auth, panier, etc.) |
| **Commande** | `cd backend && npm test` |
| **Résultat** | **7 tests — 100 % passés** |

::: {align=center}
![Tests unitaires Jest](./tests/tests-unitaires-jest.png){width=14cm}
:::


## Tests E2E frontend (Playwright)

| | |
|--|--|
| **Objectif** | Parcours réels sur le **site en production** (Vercel + API Render) |
| **Commande** | `cd frontend && npm run test:e2e` |
| **Résultat** | **7 scénarios — 100 % passés** |

| # | Scénario | Capture |
|---|----------|---------|
| 01 | Accueil | `docs/tests/e2e-01-home.png` |
| 02 | Boutique | `docs/tests/e2e-02-shop.png` |
| 03 | Filtres | `docs/tests/e2e-03-filters.png` |
| 04 | Connexion | `docs/tests/e2e-04-login-modal.png` |
| 05 | Inscription | `docs/tests/e2e-05-signup-modal.png` |
| 06 | Swagger API | `docs/tests/e2e-06-swagger.png` |

::: {align=center}
![E2E boutique](./tests/e2e-02-shop.png){width=14cm}
:::


::: {align=center}
![E2E filtres](./tests/e2e-03-filters.png){width=14cm}
:::


## Lighthouse / PageSpeed (performances)

Mesures sur **https://pokestore-hazel.vercel.app** — documentées dans le **cahier des charges** (annexe « Qualité et performances »).

| Métrique | Résultat (indicatif) |
|----------|----------------------|
| Performance mobile | 83 |
| Performance desktop | 99 |
| Accessibilité | 98 |
| Bonnes pratiques | 100 |
| SEO | 100 |

::: {align=center}
![PageSpeed desktop](./cahier-des-charges/images/pagespeed-desktop-bureau.png){width=14cm}
:::


# Reprise par un développeur (nouvel environnement)

Le dépôt Git sera **privé**. Le nouveau développeur **ne rejoint pas** les comptes Vercel / Render / Neon du projet initial.  
Il reçoit le **code source** (+ la doc) et recrée **sa propre infra**, identique en fonctionnement.

## Ce qu’il reçoit / ne reçoit pas

| Reçu | Pas reçu (à recréer) |
|------|----------------------|
| Code (`backend/`, `frontend/`, `mobile-rn/`, `pokemon-electron/` si fourni) | Accès au repo GitHub public actuel |
| `prisma/schema.prisma` + dossier `prisma/migrations/` | Base Neon existante (données prod actuelles) |
| Fichiers `.env.example` | Clés Stripe, JWT, Resend, Google du projet initial |
| `render.yaml`, `DEPLOY.md`, cette documentation | Comptes Vercel / Render / Neon de l’équipe d’origine |

**Résultat attendu :** un site + une API + une base **à lui**, avec le **même schéma** et le **même type de données** (catalogue seedé, compte admin), pas une copie byte-pour-byte de ta base prod.

---

## Étape 1 — Créer sa base PostgreSQL (Neon)

1. Compte sur [neon.tech](https://neon.tech) → **New project** → PostgreSQL.
2. Copier la **`DATABASE_URL`** (format `postgresql://…?sslmode=require`).
3. C’est **sa** base vide. Le schéma sera créé à l’étape 3 via Prisma.

> Pas besoin d’installer PostgreSQL sur son PC : Neon suffit (en local comme en prod).

---

## Étape 2 — Récupérer le code et le `.env`

```bash
# Archive fournie ou accès au nouveau dépôt privé
cd pokemon-app/backend
npm install
cp .env.example .env
```

Renseigner **toutes** les variables dans `backend/.env` (voir tableau ci-dessous). Minimum pour démarrer :

```env
DATABASE_URL=postgresql://...   # sa Neon
JWT_SECRET=...                  # chaîne aléatoire longue
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=...
```

Puis `frontend/.env` :

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Étape 3 — Reproduire la base (schéma + données comme le projet d’origine)

Le schéma est versionné dans Git. Les données de catalogue viennent du **seed**, pas d’un dump de ta prod.

```bash
cd backend

# Crée les tables (User, PokemonCard, Cart, Order…) — identiques au projet d’origine
npx prisma migrate deploy

# Importe les cartes Pokémon TCG (mêmes sets par défaut : sv1, swsh12, xy1)
npm run db:seed

# Crée le compte administrateur (rôle ADMIN) pour l’app Electron
npm run db:seed:admin

npm run start:dev   # → http://localhost:3000 — Swagger : /api/docs
```

```bash
cd frontend
npm install && cp .env.example .env
npm run dev         # → http://localhost:5173
```

| Commande | Effet |
|----------|--------|
| `prisma migrate deploy` | Applique les migrations → **même structure** de tables |
| `npm run db:seed` | Remplit le catalogue (API Pokémon TCG + fallback JSON local) |
| `npm run db:seed:admin` | Crée l’admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD` du `.env`) |

**Les commandes / paniers / commandes de ta prod ne sont pas copiés** — seulement la structure + catalogue seedé. C’est le comportement normal d’une reprise dev.

---

## Étape 4 — Services externes (ses propres comptes)

| Service | Pourquoi | Où configurer |
|---------|----------|---------------|
| **Stripe** (mode test) | Paiement | `STRIPE_*` dans `.env` + webhook vers son API |
| **Resend** | Emails en prod (Render bloque SMTP 587) | `RESEND_API_KEY`, `RESEND_FROM` sur Render |
| **Google Cloud** | Connexion Google | OAuth client + `GOOGLE_CALLBACK_URL` |
| **Pokémon TCG API** (optionnel) | Meilleur quota seed | `POKEMON_TCG_API_KEY` |

En **local**, les emails peuvent passer par Gmail (`MAIL_*` dans `.env`). En **prod sur Render**, utiliser **Resend** (HTTPS).

---

## Étape 5 — Mettre en ligne (sa prod)

Ordre recommandé (détail : `DEPLOY.md` à la racine du projet) :

```
1. Neon     → DATABASE_URL
2. Render   → Blueprint (render.yaml) ou service Node manuel
              → coller toutes les variables d’environnement
              → avant ou après 1er deploy : npx prisma migrate deploy (avec sa DATABASE_URL)
              → npm run db:seed && npm run db:seed:admin (une fois, en local contre sa Neon)
3. Vercel   → root directory : frontend/
              → VITE_API_URL=https://SON-API.onrender.com/api
4. Render   → mettre à jour FRONTEND_URL avec l’URL Vercel → redeploy
5. Google   → callback : https://SON-API.onrender.com/api/auth/google/callback
6. Stripe   → webhook : https://SON-API.onrender.com/api/stripe/webhook
```

| Composant | Hébergeur | Fichier de référence |
|-----------|-----------|----------------------|
| API | Render | `render.yaml` |
| Web | Vercel | `frontend/vercel.json` |
| BDD | Neon | `backend/prisma/` |
| Mobile | EAS / Expo | `mobile-rn/.env` → `EXPO_PUBLIC_API_URL` = son API |
| Admin | Build local | `pokemon-electron/` → login `POST /api/auth/admin/login` |

---

## Étape 6 — Mobile et admin

**Mobile** — mettre à jour `mobile-rn/.env` :

```env
EXPO_PUBLIC_API_URL=https://SON-API.onrender.com/api
EXPO_PUBLIC_WEB_URL=https://SON-SITE.vercel.app
```

Puis rebuild APK (`eas build`) si livraison binaire.

**Admin Electron** — pointer vers **son** API Render. Se connecter avec le compte créé par `db:seed:admin`. Build : `cd pokemon-electron && npm run make`.

---

## Variables d’environnement — liste complète

Modèles : `backend/.env.example`, `frontend/.env.example`, `mobile-rn/.env.example`

| Variable | Local | Prod (Render / Vercel) |
|----------|-------|-------------------------|
| `DATABASE_URL` | Sa Neon | Même Neon (Render) |
| `JWT_SECRET` | `.env` | Render |
| `FRONTEND_URL` | `http://localhost:5173` | URL Vercel |
| `VITE_API_URL` | `http://localhost:3000/api` | Dashboard Vercel |
| `STRIPE_*` | Clés test Stripe | Render + dashboard Stripe |
| `RESEND_*` | Optionnel en local | **Obligatoire** sur Render |
| `GOOGLE_*` | `.env` + console Google | Render + URLs de callback prod |
| `EXPO_PUBLIC_API_URL` | IP locale ou Render | Son URL Render |

---

## Vérifier que tout marche

```bash
cd backend && npm test              # 7 tests unitaires
cd frontend && npm run test:e2e     # 7 scénarios (adapter l’URL cible si besoin)
```

Swagger (sa API) : `https://SON-API.onrender.com/api/docs`

---

*Documentation technique — PokéStore — Juin 2026*
