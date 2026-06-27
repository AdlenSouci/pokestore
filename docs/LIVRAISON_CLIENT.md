---
title: "Dossier de livraison client — PokéStore"
subtitle: "Inventaire et méthodologie de remise"
author: "[Équipe PokéStore]"
date: "Juin 2026"
lang: fr-FR
toc-title: "Table des matières"
---

Ce document liste **concrètement ce que le client reçoit** et la **méthodologie** de remise du projet.

# Inventaire des livrables

### 1.1 Applications

| Livrable | Type | Accès / fichier |
|----------|------|-----------------|
| **Application web** | Site en production | https://pokestore-hazel.vercel.app |
| **Application mobile** | APK Android | Fichier `.apk` (EAS) ou QR Expo Go |
| **Application admin** | Installateur Windows | `pokemon-electron-1.0.1 Setup.exe` |
| **API** | Service REST | https://pokestore-api-btz1.onrender.com/api |
| **Code source** | Dépôt Git | https://github.com/AdlenSouci/pokestore |

### 1.2 Documents (à remettre au client)

| # | Document | Fichier | Rôle |
|---|----------|---------|------|
| 1 | **Cahier des charges** | `CAHIER_DES_CHARGES_POKEMON_APP.docx` | Spécifications des 3 apps + périmètre |
| 2 | **Documentation fonctionnelle** | `DOCUMENTATION_FONCTIONNELLE.docx` | Ce que font les apps (métier) |
| 3 | **Documentation technique** | `DOCUMENTATION_TECHNIQUE.docx` | Architecture, API, BDD, déploiement |
| 4 | **Guide utilisateur** | `GUIDE_UTILISATEUR.docx` | Mode d’emploi client web + mobile |
| 5 | **Dossier de livraison** | `LIVRAISON_CLIENT.docx` | Inventaire + méthodologie + recette |
| 6 | **Synthèse projet** | `PokeStore-Livraison-Client/06-Synthese-projet-captures.docx` | Vue globale + captures |

**Optionnel admin :** `pokemon-electron/ADMIN_PANEL_GUIDE.md`

### 1.3 Accès et comptes (remise séparée, hors documents)

Le client reçoit un **tableau des accès** (email / mot de passe ou invitation) — **jamais** dans le Word public :

| Service | Usage |
|---------|--------|
| GitHub | Code source |
| Vercel | Hébergement web |
| Render | Hébergement API |
| Neon | Base PostgreSQL |
| Stripe | Paiements |
| Resend | Emails |
| Google Cloud | OAuth |
| Expo (EAS) | Build APK |

Modèle : `backend/.env.example` (noms des variables sans valeurs).

---

## 2. Méthodologie de livraison (comment on remet le projet)

### Étape 1 — Avant la remise

- [ ] Vérifier que le **site**, l’**API** et l’**APK** fonctionnent
- [ ] Compléter prénoms / promo sur les documents
- [ ] Exporter en **PDF ou Word** les docs si le client ne lit pas le Markdown
- [ ] Préparer le **fichier `.exe`** admin si demandé
- [ ] Préparer la **fiche accès** (comptes) dans un canal sécurisé

### Étape 2 — Remise (réunion ou mail)

1. **Présentation** (15–20 min) : démo web + mobile + admin
2. **Remise des documents** (dossier `docs/` ou ZIP)
3. **Remise des accès** (hors ZIP public)
4. **Recette** : parcourir avec le client les scénarios du guide utilisateur

### Étape 3 — Recette client (validation)

| # | Scénario | OK client |
|---|----------|-----------|
| R1 | S’inscrire sur le web | ☐ |
| R2 | Acheter une carte (Stripe test) | ☐ |
| R3 | Voir la collection | ☐ |
| R4 | Même compte sur mobile | ☐ |
| R5 | Envoyer un message contact | ☐ |
| R6 | Admin : importer 10 cartes | ☐ |
| R7 | Admin : voir dashboard et commandes | ☐ |

Signature client : _________________ Date : _________

### Étape 4 — Après livraison

- Support : préciser durée (ex. 2 semaines corrections mineures)
- Formation admin : 30 min sur Electron si besoin
- Évolutions : hors périmètre v1 (favoris, fond d’écran IA…)

---

## 3. Équivalence sujet Ynov → PokéStore

| Exigence officielle | Livrable PokéStore |
|---------------------|-------------------|
| Application web (gérance) | Site + **admin Electron** pour la gestion |
| Application mobile (commandes clients) | `mobile-rn/` APK |
| Backend + BDD | NestJS + Neon |
| **Documentation fonctionnelle** | `DOCUMENTATION_FONCTIONNELLE.md` |
| **Documentation technique** | `DOCUMENTATION_TECHNIQUE.md` |

---

## 4. Arborescence du dossier client (ZIP type)

```
PokeStore-Livraison-Client/     ← dossier prêt à envoyer
├── 01-CAHIER_DES_CHARGES_POKEMON_APP.docx
├── 02-DOCUMENTATION_FONCTIONNELLE.docx
├── 03-DOCUMENTATION_TECHNIQUE.docx
├── 04-GUIDE_UTILISATEUR.docx
├── 05-LIVRAISON_CLIENT.docx
├── 06-LIVRABLE_ORAL_FINAL_v12.docx
├── apps/
│   ├── pokestore.apk
│   └── pokemon-electron-setup.exe
└── ACCES-CONFIDENTIEL.txt   (remis à part, jamais par email public)
```

Regénérer les Word : `powershell -File docs\scripts\generate-client-docs.ps1`

---

## 5. Qui lit quoi ?

| Lecteur | Documents |
|---------|-----------|
| **Client / chef de projet** | Livraison (ce doc) + Fonctionnelle + Guide utilisateur |
| **Développeur qui reprend** | Technique + README + Swagger |
| **Utilisateur final** | Guide utilisateur |
| **Admin boutique** | Guide admin Electron + Guide utilisateur (partie admin) |
| **Jury Ynov** | Livrable v12 + oral |

---

*Dossier de livraison — PokéStore — Juin 2026*
