# Grille de Validation : Projet Pokémon App (Ynov B3 DEV)

Ce document liste toutes les fonctionnalités attendues par l'école.
Coche les cases (`[x]`) au fur et à mesure que nous avançons !

## ✅ Déjà Réalisé (Validé)

- [x] **Concevoir une application web avec un framework moderne**
  - *Fait : Utilisation de React & Vite.*
- [x] **Développer des interfaces utilisateurs compatibles avec plusieurs supports**
  - *Fait : TailwindCSS utilisé pour le responsive.*
- [x] **Implémenter une architecture backend orientée services**
  - *Fait : NestJS (Controllers/Services/Modules).*
- [x] **Gérer les appels vers une base de données relationnelles**
  - *Fait : Prisma + PostgreSQL.*
- [x] **Implémenter des mécanismes d'authentification et d'autorisation sécurisés**
  - *Fait : Auth bcrypt + Google OAuth + Token JWT.*
- [x] **Concevoir un modèle de données pour gérer les différentes entités**
  - *Fait : Schéma Prisma avec relations Users, Cards, Carts, Orders, Favorites.*
- [x] **Écrire des requêtes SQL pour interagir entre les API et la BDD**
  - *Fait : Via Prisma Client (CRUD complet).*
- [x] **Versionner son code**
  - *Fait : Dépôt Git existant.*

---

## 🚀 À Faire (Pour avoir 20/20)

### 1. Sécurité de l'API (Backend)
- [x] Restreindre le CORS dans main.ts (Vercel + `FRONTEND_URL` + localhost).
- [x] Installer et configurer helmet pour les headers de sécurité HTTP.
- [x] Ajouter un @nestjs/throttler (Rate Limiting) global + limite renforcée sur login.
- [x] Protéger `/api/cards/import` et `/api/cards/reprice` (JWT + rôle ADMIN).

### 2. Expérience Utilisateur & Feedbacks (Frontend)
- [x] Remplacer les alertes basiques JavaScript par des Toasts (ex: react-hot-toast).
- [x] Ajouter des états de chargement (loaders/spinners) visuels pendant les appels API (ex: ajout au panier, connexion).
- [x] Gérer les messages d'erreur de façon claire dans l'UI (ex: "Mot de passe incorrect" direct sur le modal).

### 3. Accessibilité & Performances (Frontend)
- [x] Lancer un audit Lighthouse (Chrome) et corriger les contrastes de couleurs si besoin.
  - *Fait : PageSpeed 99 perf / 98 a11y desktop — captures dans `docs/cahier-des-charges/images/`.*
- [x] Ajouter des attributs aria-label sur les icônes (ex: panier, profil, fermeture de modal).
- [x] Utiliser le lazy-loading pour les images des cartes Pokémon (loading="lazy").
- [x] Menu mobile complet dans la Navbar (hamburger + navigation).

### 4. Documentation & Qualité (Global)
- [x] Installer Swagger (@nestjs/swagger) sur le backend pour générer une doc API interactive pour les profs.
- [x] Rédiger la suite de ce README.md complet (Installation, lancement de la BDD, scripts).

### 5. Application Mobile (Bonus obligatoire)
- [x] Développer l'application mobile (React Native / Expo) connectée à l'API NestJS existante (`mobile-rn/`).
- [x] Écrans commandes et collection sur mobile (`OrdersScreen`, `CollectionScreen`).
- [x] APK Android via EAS Build (preview).

### 6. SEO & Livrables oral
- [x] SEO : react-helmet-async, robots.txt, sitemap.xml (`mise_en_place_seo.md`).
- [x] Livrable synthèse oral (`docs/LIVRABLE_ORAL_FINAL.md`).
- [x] Tests E2E Playwright (7 tests, 100% passés — captures dans `docs/tests/`).
- [x] Formulaire contact par email (`/contact` + `POST /api/contact` + captcha HMAC + Resend).
- [x] Audit Lighthouse formalisé avec captures (PageSpeed Insights).
