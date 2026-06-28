# Guide reprise développeur — PokéStore

Document court pour un **nouveau développeur** qui reçoit le code en **dépôt privé**.  
Il ne rejoint **pas** les comptes Vercel / Render / Neon du projet initial.

**Prod actuelle (référence) :** https://pokestore-hazel.vercel.app  
**Code :** dépôt privé fourni par l’équipe d’origine

---

## Checklist rapide

| # | Action | Détail |
|---|--------|--------|
| 1 | Récupérer le code | Clone du dépôt privé ou archive ZIP |
| 2 | Créer une base **Neon** | [neon.tech](https://neon.tech) → copier `DATABASE_URL` |
| 3 | Configurer `backend/.env` | `cp .env.example .env` — voir `backend/.env.example` |
| 4 | Créer le schéma | `cd backend && npx prisma migrate deploy` |
| 5 | Peupler le catalogue | `npm run db:seed` |
| 6 | Créer l’admin | `npm run db:seed:admin` (voir `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans `.env`) |
| 7 | Lancer en local | `npm run start:dev` (API) + `cd frontend && npm run dev` |
| 8 | Comptes externes | Stripe (test), Resend, Google OAuth — **ses** clés |
| 9 | Déployer | `DEPLOY.md` + `render.yaml` + Vercel (`frontend/`) |
| 10 | Mobile / admin | Mettre à jour `EXPO_PUBLIC_API_URL` + rebuild ; Electron → son API |

---

## Base de données — même structure, nouvelles données

```bash
cd backend
npm install
cp .env.example .env
# Renseigner DATABASE_URL (sa Neon) + JWT_SECRET + ADMIN_* + clés optionnelles

npx prisma migrate deploy   # tables identiques au projet d’origine
npm run db:seed             # catalogue cartes (sets : sv1, swsh12, xy1)
npm run db:seed:admin       # compte ADMIN pour le panel Electron
npm run start:dev
```

| Ce qui est recréé | Ce qui ne l’est pas |
|-------------------|---------------------|
| Schéma (User, Card, Cart, Order…) | Comptes clients de la prod d’origine |
| Catalogue via seed | Paniers / commandes historiques |
| Son compte admin | Données perso des utilisateurs prod |

---

## Fichiers `.env` à remplir

| Fichier | Variables clés |
|---------|----------------|
| `backend/.env` | `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `STRIPE_*`, `RESEND_*`, `GOOGLE_*`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| `frontend/.env` | `VITE_API_URL` (local : `http://localhost:3000/api`) |
| `mobile-rn/.env` | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WEB_URL` |
| `pokemon-electron/.env` | URL de l’API (selon config du projet) |

**Emails en prod :** Render bloque SMTP → utiliser **Resend** (`RESEND_API_KEY` sur Render).

---

## Mise en ligne (ordre)

1. **Neon** — base créée, `DATABASE_URL` prête  
2. **Migrations + seed** — lancer une fois contre cette Neon (en local)  
3. **Render** — service API (`render.yaml`), coller toutes les variables  
4. **Vercel** — `frontend/`, `VITE_API_URL=https://SON-API.onrender.com/api`  
5. **Render** — mettre à jour `FRONTEND_URL` → URL Vercel → redeploy  
6. **Google OAuth** — callback : `https://SON-API.onrender.com/api/auth/google/callback`  
7. **Stripe** — webhook : `https://SON-API.onrender.com/api/stripe/webhook`  

Détail : `DEPLOY.md` à la racine du projet.

---

## Admin Electron

- Connexion : `POST /api/auth/admin/login` — **rôle `ADMIN` obligatoire** (un compte `USER` est refusé).  
- Build : `cd pokemon-electron && npm install && npm run make`  
- L’app appelle l’API ; la sécurité est **côté serveur** (JWT + `AdminGuard`).

---

## Tests

```bash
cd backend && npm test              # 7 tests Jest
cd frontend && npm run test:e2e     # 7 scénarios Playwright
```

Swagger (une fois l’API déployée) : `https://SON-API.onrender.com/api/docs`

---

## Docs complémentaires

| Document | Contenu |
|----------|---------|
| `README.md` | Installation locale |
| `DEPLOY.md` | Vercel + Render + Neon |
| `docs/DOCUMENTATION_TECHNIQUE.md` | Archi, API, tests, prod |
| `docs/METHODOLOGIE_UTILISATEUR.md` | Parcours utilisateur |

---

*PokéStore — Guide reprise développeur — Juin 2026*
