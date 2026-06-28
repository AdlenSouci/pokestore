---
title: "Cahier des charges — PokéStore"
subtitle: "Spécifications des 3 applications"
author: "[Équipe PokéStore]"
date: "Juin 2026"
lang: fr-FR
toc-title: "Table des matières"
---

**Version :** Juin 2026 — alignée sur l’état livré du projet

# Objet du projet

Développer une plateforme e-commerce de **cartes Pokémon TCG** comprenant :

| Application | Rôle | Utilisateurs |
|-------------|------|--------------|
| **Application web** | Boutique en ligne, compte client, paiement | Collectionneurs / acheteurs (rôle `USER`) |
| **Application mobile** | Même parcours d’achat sur smartphone | Clients en mobilité (rôle `USER`) |
| **Application admin (desktop)** | Gestion catalogue, ventes, commandes | **Administrateurs uniquement** (rôle `ADMIN`) |
| **API + base de données** | Logique métier, persistance, sécurité | Support des 3 applications |

Le **site web** et l’**app mobile** sont réservés aux **clients**. L’**application admin Electron** est réservée aux comptes avec le rôle **`ADMIN`** — un client (`USER`) ne peut pas s’y connecter.

---

## Contexte et objectifs

### Contexte

Les collectionneurs ont besoin d’un catalogue filtrable, d’un paiement sécurisé et d’un suivi de leurs achats. L’expérience doit être cohérente entre navigateur et téléphone.

### Objectifs

- Consulter un catalogue riche (filtres, pagination, détail carte).
- Créer un compte et se connecter (email ou Google).
- Ajouter des cartes au panier et payer via **Stripe**.
- Consulter **commandes** et **collection** (cartes achetées).
- Contacter la boutique via un **formulaire** sécurisé.
- Permettre à l’**admin** d’importer des cartes, ajuster les prix et suivre les ventes.

---

## Périmètre fonctionnel par application

### Application web (`frontend/`)

**URL production :** https://pokestore-hazel.vercel.app

| ID | Fonctionnalité | Description | Livré |
|----|----------------|-------------|-------|
| W-01 | Accueil | Hero, animation, CTA vers la boutique | ✅ |
| W-02 | Boutique | Catalogue paginé, filtres (prix, année, série, set, rareté, recherche) | ✅ |
| W-03 | Détail carte | Modal plein écran, effets visuels par type | ✅ |
| W-04 | Inscription / connexion | Email + mot de passe, modales | ✅ |
| W-05 | Connexion Google | OAuth | ✅ |
| W-06 | Panier | Ajout, quantités, suppression | ✅ |
| W-07 | Paiement Stripe | Checkout redirect + confirmation | ✅ |
| W-08 | Mes commandes | Historique et détail | ✅ |
| W-09 | Ma collection | Cartes des commandes payées, badge quantité | ✅ |
| W-10 | Profil | Nom, téléphone, mot de passe | ✅ |
| W-11 | Contact | Formulaire + captcha, envoi email | ✅ |
| W-12 | Responsive | Desktop, tablette, mobile (Tailwind) | ✅ |
| W-13 | SEO | Meta, OG, sitemap, robots.txt | ✅ |

**Routes :** `/`, `/shop`, `/collection`, `/contact`

---

### Application mobile (`mobile-rn/`)

**Distribution :** Expo Go (dev) + APK Android (EAS Build)

| ID | Fonctionnalité | Description | Livré |
|----|----------------|-------------|-------|
| M-01 | Accueil | Branding, animation, CTA boutique | ✅ |
| M-02 | Boutique | Grille, filtres, pagination (même API) | ✅ |
| M-03 | Détail carte | Effets canvas + tilt 3D | ✅ |
| M-04 | Inscription / connexion | JWT persisté (AsyncStorage) | ✅ |
| M-05 | Connexion Google | OAuth mobile (`pokestore://`) | ✅ |
| M-06 | Panier | Gestion articles | ✅ |
| M-07 | Paiement Stripe | Checkout in-app browser | ✅ |
| M-08 | Mes commandes | Liste, statuts PENDING / PAID / CANCELLED | ✅ |
| M-09 | Ma collection | Grille cartes achetées | ✅ |
| M-10 | Contact | Formulaire + captcha | ✅ |

**Écrans :** Home, Shop, CardDetail, Login, Register, Cart, Orders, Collection, Contact

---

### Application admin desktop (`pokemon-electron/`)

**Accès réservé :** compte avec rôle **`ADMIN`** uniquement. Connexion via `POST /api/auth/admin/login` — les comptes clients (`USER`) sont **refusés**.

**Distribution :** Installateur Windows `.exe` (`npm run make`)  
**Note :** Projet local (hors dépôt Git principal), connecté à l’API Render et à Neon.

| ID | Fonctionnalité | Description | Livré |
|----|----------------|-------------|-------|
| A-01 | Connexion admin | `POST /api/auth/admin/login` — **rôle ADMIN obligatoire** (refus si USER) | ✅ |
| A-02 | Dashboard | CA, ventes payées, graphique 6 mois, top produit | ✅ |
| A-03 | Pokemon Cards | Liste, import API TCG, édition inline, CSV | ✅ |
| A-04 | Clients | Liste et création utilisateurs | ✅ |
| A-05 | Orders | Liste commandes, changement statut | ✅ |
| A-06 | Pipeline | Suivi clients par étape (kanban) | ✅ |
| A-07 | Relances | Commandes / clients à relancer | ✅ |

---

### API et données (`backend/`)

| ID | Fonctionnalité | Livré |
|----|----------------|-------|
| B-01 | API REST NestJS préfixe `/api` | ✅ |
| B-02 | Documentation Swagger `/api/docs` | ✅ |
| B-03 | Auth JWT + Google OAuth | ✅ |
| B-04 | Rôle ADMIN + guards | ✅ |
| B-05 | Catalogue, panier, commandes, Stripe webhook | ✅ |
| B-06 | Contact + emails (Resend en prod) | ✅ |
| B-07 | PostgreSQL Neon + Prisma | ✅ |
| B-08 | Helmet, throttler, CORS | ✅ |

---

## Exigences non fonctionnelles

| Domaine | Exigence | Livré |
|---------|----------|-------|
| Sécurité | JWT, bcrypt, validation DTO, routes admin protégées | ✅ |
| Performance | Pagination catalogue, lazy-loading images | ✅ |
| Accessibilité | aria-label, PageSpeed a11y 98 | ✅ |
| Disponibilité | Hébergement Vercel + Render + Neon | ✅ |
| Tests | Jest (7) + Playwright E2E (7) | ✅ |

---

## Hors périmètre (v1)

- Application iOS native (App Store) — Android APK uniquement
- Favoris utilisateur (modèle BDD prêt, UI non livrée)
- Publication Electron sur un store

---

## Livrables documentaires

| Document | Fichier |
|----------|---------|
| Cahier des charges | `docs/cahier-des-charges/CAHIER_DES_CHARGES_POKEMON_APP.md` |
| Méthodologie utilisateur | `docs/METHODOLOGIE_UTILISATEUR.md` |
| Documentation technique | `docs/DOCUMENTATION_TECHNIQUE.md` |

---

# Annexes visuelles

## Application web

![Accueil](./images/capture-v2-home-hero.png)

![Boutique](./images/capture-v2-shop.png)

## Application mobile

![Accueil mobile](./images/capture-mobile-home.png)

![Collection](./images/capture-mobile-collection.png)

## Application admin Electron

![Dashboard](./images/capture-electron-dashboard.png)

![Catalogue](./images/capture-electron-cartes.png)

![Commandes](./images/capture-electron-commandes.png)

## Qualité et performances

![PageSpeed](./images/pagespeed-desktop-bureau.png)

---

*PokéStore — Cahier des charges — Juin 2026*
