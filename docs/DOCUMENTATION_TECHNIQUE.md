---
title: "Documentation technique — PokéStore"
subtitle: "Architecture, API, déploiement"
author: "[Équipe PokéStore]"
date: "Juin 2026"
lang: fr-FR
toc-title: "Table des matières"
---

Pour **reprendre ou héberger** le projet. Pour les parcours utilisateur, voir **Méthodologie utilisateur**.

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
| Swagger | https://pokestore-api-btz1.onrender.com/api/docs |
| Git | https://github.com/AdlenSouci/pokestore |

# Stack

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
| `PokemonCard` | Catalogue |
| `Cart` / `CartItem` | Panier |
| `Order` / `OrderItem` | Commandes (`PENDING`, `PAID`, `CANCELLED`) |

# API principale

Détail complet : Swagger `/api/docs`

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/auth/register` | — | Inscription |
| `POST /api/auth/login` | — | Connexion |
| `GET /api/cards` | — | Catalogue + filtres |
| `GET/POST/PATCH/DELETE /api/cart/*` | JWT | Panier |
| `POST /api/orders/checkout-session` | JWT | Paiement Stripe |
| `GET /api/orders` | JWT | Commandes |
| `POST /api/stripe/webhook` | Signature | Confirmation paiement |
| `POST /api/wallpaper/generate` | JWT | Fond d’écran IA (mobile) |
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

# Fond d’écran IA (mobile)

- Carte **payée** en collection obligatoire
- **Gemini en priorité** si `GEMINI_API_KEY` est sur Render (modèle `gemini-2.5-flash-image`, ratio 9:16)
- Route : `POST /api/wallpaper/generate` (JWT)
- Fichier : `backend/src/wallpaper/wallpaper.service.ts`
- **Après modification : redéployer l’API sur Render**

# Sécurité

JWT, bcrypt, Helmet, rate limiting, captcha contact, signature webhook Stripe, CORS.

# Déploiement

| Composant | Hébergeur |
|-----------|-----------|
| Web | Vercel |
| API | Render |
| BDD | Neon |
| APK | EAS (Expo) |
| Admin | Build local `npm run make` |

Render gratuit : cold start ~30–60 s après inactivité.

# Variables d’environnement

Modèles : `backend/.env.example`, `frontend/.env.example`, `mobile-rn/.env.example`

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | PostgreSQL |
| `JWT_SECRET` | Tokens |
| `FRONTEND_URL` | CORS, OAuth, Stripe |
| `STRIPE_*` | Paiement |
| `RESEND_API_KEY` | Emails prod |
| `GEMINI_API_KEY` | Fond d’écran IA |
| `VITE_API_URL` / `EXPO_PUBLIC_API_URL` | URL API |

# Installation locale

```bash
cd backend && npm install && cp .env.example .env
npx prisma migrate dev && npm run db:seed && npm run db:seed:admin
npm run start:dev

cd frontend && npm install && cp .env.example .env && npm run dev
```

# Tests

| Commande | Résultat |
|----------|----------|
| `cd backend && npm test` | 7/7 |
| `cd frontend && npm run test:e2e` | 7/7 |

![Swagger](./tests/e2e-06-swagger.png)

---

*Documentation technique — PokéStore — Juin 2026*
