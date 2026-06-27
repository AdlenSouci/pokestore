---
title: "Documentation fonctionnelle — PokéStore"
subtitle: "Livrable client"
author: "[Équipe PokéStore]"
date: "Juin 2026"
lang: fr-FR
toc-title: "Table des matières"
---

Document destiné au **client** : décrit **ce que font** les applications, **pour qui**, et **comment** un utilisateur les emploie au quotidien.

# Vue d’ensemble

PokéStore permet d’**acheter des cartes Pokémon TCG** en ligne et de **retrouver sa collection** après achat.

Trois applications côté utilisateur :

| Application | Qui l’utilise | Rôle métier |
|-------------|---------------|-------------|
| **Site web** | Client | Découvrir, acheter, suivre commandes et collection |
| **App mobile** | Client | Même usage sur smartphone |
| **Admin desktop** | Gérant / admin | Gérer le catalogue, les ventes et les commandes |

---

## 2. Application web — fonctionnalités

**Accès :** https://pokestore-hazel.vercel.app

### 2.1 Parcours visiteur (non connecté)

1. Arrivée sur l’**accueil** (présentation, animation).
2. Navigation vers la **boutique**.
3. Consultation du catalogue : **filtres** et **recherche**.
4. Clic sur une carte → **détail** (zoom, effets).
5. **Ajout au panier** (toast de confirmation).
6. À la commande : **inscription** ou **connexion** obligatoire.

### 2.2 Parcours client connecté

1. **Panier** : modifier quantités, supprimer, lancer le paiement.
2. **Stripe** : redirection vers la page de paiement sécurisée.
3. Retour sur le site → **Mes commandes** (statut Payée / En attente).
4. **Ma collection** : toutes les cartes issues des commandes payées.
5. **Profil** : modifier nom, téléphone, mot de passe.
6. **Contact** : envoyer un message à l’équipe (captcha anti-spam).

### 2.3 Connexion

- **Email + mot de passe**
- **Google** (bouton « Continuer avec Google »)

### 2.4 Règles métier

- Une commande **PAID** alimente la **collection**.
- Le panier est **lié au compte** (JWT).
- Les prix affichés sont ceux en base au moment de l’achat.

---

## 3. Application mobile — fonctionnalités

**Accès :** APK Android (EAS) ou Expo Go en développement.

Fonctionnellement **identique au web** pour le client :

| Écran | Fonction |
|-------|----------|
| Accueil | Entrée dans l’application |
| Boutique | Catalogue + filtres |
| Détail carte | Visualisation enrichie |
| Connexion / Inscription | Compte utilisateur |
| Panier | Achat |
| Mes commandes | Suivi |
| Ma collection | Cartes possédées |
| Contact | Message à la boutique |

**Spécificité mobile :** connexion Google via le navigateur système puis retour dans l’app.

---

## 4. Application admin desktop — fonctionnalités

**Accès :** installateur Windows `pokemon-electron` (compte **ADMIN** uniquement).

| Module | Usage métier |
|--------|--------------|
| **Dashboard** | Vue d’ensemble : chiffre d’affaires, ventes, graphique mensuel |
| **Pokemon Cards** | Importer des cartes (API Pokémon TCG), modifier prix/nom, exporter CSV |
| **Clients** | Voir et créer des comptes |
| **Orders** | Suivre les commandes, changer le statut |
| **Pipeline** | Organiser le suivi commercial des clients |
| **Relances** | Identifier les relances à effectuer |

L’admin **ne remplace pas** le site client : il sert à **gérer** la boutique.

---

## 5. Acteurs et droits

| Acteur | Web | Mobile | Admin |
|--------|-----|--------|-------|
| Visiteur | Consulter boutique | Consulter boutique | — |
| Client (USER) | Acheter, collection, contact | Idem | — |
| Admin (ADMIN) | — | — | Tous modules admin |

---

## 6. Cas d’usage principaux

### CU-01 — Acheter une carte (web ou mobile)

1. Parcourir la boutique  
2. Ajouter au panier  
3. Se connecter  
4. Payer via Stripe  
5. Voir la commande en statut **PAID**  
6. Retrouver la carte dans **Ma collection**

### CU-02 — Contacter la boutique

1. Aller sur **Contact**  
2. Remplir nom, email, message  
3. Résoudre le captcha  
4. Envoyer → email reçu par l’équipe (Resend)

### CU-03 — Importer des cartes (admin)

1. Se connecter en admin  
2. Module **Pokemon Cards**  
3. Choisir le nombre (10 / 20 / 50) ou sync API  
4. Les cartes apparaissent sur le **site** et l’**app mobile**

---

## 7. Interfaces et ergonomie

- **Thème** : univers Pokémon rétro / arcade (couleurs violet-vert).
- **Feedbacks** : toasts succès/erreur, loaders pendant les appels API.
- **Responsive** : site utilisable sur desktop, tablette et navigateur mobile.

# Captures d'écran — application web

![Accueil web](./cahier-des-charges/images/capture-v2-home-hero.png)

![Boutique web](./cahier-des-charges/images/capture-v2-shop.png)

![Connexion](./cahier-des-charges/images/capture-v2-auth-login.png)

# Captures d'écran — application mobile

![Accueil mobile](./cahier-des-charges/images/capture-mobile-home.png)

![Collection mobile](./cahier-des-charges/images/capture-mobile-collection.png)

![Commandes mobile](./cahier-des-charges/images/capture-mobile-orders.png)

# Captures d'écran — application admin

![Dashboard admin](./cahier-des-charges/images/capture-electron-dashboard.png)

![Catalogue cartes admin](./cahier-des-charges/images/capture-electron-cartes.png)

![Commandes admin](./cahier-des-charges/images/capture-electron-commandes.png)

---

*Documentation fonctionnelle — PokéStore — Juin 2026*
