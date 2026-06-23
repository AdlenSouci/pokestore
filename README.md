# PokéCard — Projet Ynov B3 DEV

Plateforme web et mobile de collection et d'achat de cartes Pokémon TCG.

| Brique | Stack | Dossier |
|--------|-------|---------|
| Frontend web | React 19, Vite, Tailwind | `frontend/` |
| API | NestJS 11, Prisma, PostgreSQL | `backend/` |
| Mobile | React Native, Expo SDK 54 | `mobile-rn/` |

**Documentation fonctionnelle :** [`docs/cahier-des-charges/CAHIER_DES_CHARGES_POKEMON_APP.md`](docs/cahier-des-charges/CAHIER_DES_CHARGES_POKEMON_APP.md)  
**Documentation API interactive :** http://localhost:3000/api/docs (Swagger)

---

## Prérequis

- **Node.js** 20+
- **PostgreSQL** (local ou [Neon](https://neon.tech))
- Comptes optionnels : Google OAuth, Stripe, Resend/Gmail (emails), clé API Pokémon TCG

---

## Installation rapide

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Renseigner au minimum dans `backend/.env` :

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/pokemon_app
JWT_SECRET=un-secret-long-et-aleatoire
FRONTEND_URL=http://localhost:5173
```

Puis initialiser la base et lancer l'API :

```bash
npx prisma migrate dev
npm run db:seed          # importe des cartes depuis l'API Pokémon TCG
npm run start:dev        # → http://localhost:3000
```

### 2. Frontend web

```bash
cd frontend
npm install
cp .env.example .env
```

Dans `frontend/.env` :

```env
VITE_API_URL=http://localhost:3000/api
```

```bash
npm run dev              # → http://localhost:5173
```

### 3. Application mobile (Expo Go)

L’app mobile utilise **la même infra que le web** — pas besoin de lancer le backend en local.

```bash
cd mobile-rn
npm install
cp .env.example .env   # déjà configuré pour Render + Vercel
npm start
# Scanner le QR code avec Expo Go
```

Dans `mobile-rn/.env` (valeurs par défaut) :

```env
EXPO_PUBLIC_API_URL=https://pokestore-api-btz1.onrender.com/api
EXPO_PUBLIC_WEB_URL=https://pokestore-hazel.vercel.app
```

> **Render (gratuit)** : le 1er appel peut prendre ~30 s (réveil du serveur). Ensuite c’est fluide.

---

## Variables d'environnement

### Backend (`backend/.env.example`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connexion PostgreSQL |
| `JWT_SECRET` | Secret de signature des tokens |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google (optionnel) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Paiement Stripe (optionnel) |
| `MAIL_*` | Envoi d'emails (bienvenue, confirmation commande) |
| `POKEMON_TCG_API_KEY` | Clé API Pokémon TCG (optionnel, meilleur quota) |
| `POKEMON_TCG_SET_IDS` | Sets à importer au seed (ex. `sv1,swsh12`) |

### Frontend (`frontend/.env.example`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL de l'API (avec `/api`) |

### Mobile (`mobile-rn/.env.example`)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | URL de l'API accessible depuis le téléphone |

---

## Scripts utiles

### Backend

| Commande | Action |
|--------|--------|
| `npm run start:dev` | API en mode watch |
| `npm run db:seed` | Peupler la base avec des cartes |
| `npm run db:reprice` | Recalculer les prix selon la rareté |
| `npm run test` | Tests unitaires |

### Frontend

| Commande | Action |
|--------|--------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |

### Mobile

| Commande | Action |
|--------|--------|
| `npm start` | Expo Dev Tools |
| `npm run android` | Émulateur Android |
| `npm run ios` | Simulateur iOS (macOS) |

---

## Endpoints principaux

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/auth/register` | — | Inscription |
| `POST /api/auth/login` | — | Connexion |
| `GET /api/cards` | — | Catalogue (filtres, pagination) |
| `GET /api/cart` | JWT | Panier utilisateur |
| `POST /api/orders/checkout-session` | JWT | Session Stripe |
| `GET /api/orders` | JWT | Historique commandes |

Liste complète : **http://localhost:3000/api/docs**

---

## Structure du projet

```
pokemon-app/
├── backend/          # API NestJS + Prisma
├── frontend/         # Interface web React
├── mobile-rn/        # App mobile Expo
├── docs/             # Cahier des charges (MD, HTML, PDF)
└── task.md           # Grille de validation Ynov
```

---

## Import des cartes Pokémon

Les cartes sont synchronisées depuis l'**API Pokémon TCG v2** vers PostgreSQL.

```bash
# Via seed (recommandé)
cd backend && npm run db:seed

# Via HTTP (dev)
curl "http://localhost:3000/api/cards/import?sets=sv1&limit=50"
```

Un fallback JSON local (`backend/src/data/pokemon-tcg-data/`) existe si l'API externe est indisponible.

---

## Déploiement (référence)

- **Frontend** : Vercel (`frontend/vercel.json`)
- **Backend** : Render ou équivalent — définir les variables d'env et `FRONTEND_URL` vers l'URL Vercel

---

## Équipe & contexte

Projet réalisé dans le cadre du **UF DEV B3** — Ynov Informatique (sujet libre mobilisant les mêmes compétences que le Smart Café).
