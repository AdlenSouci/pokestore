---
lang: fr-FR
toc-title: "Table des matières"
---

**Projet :** PokéStore — boutique en ligne de cartes Pokémon TCG  
**Version :** Juin 2026 — Version corrigée  
**Type :** Projet UF DEV B3 — sujet libre (équivalent Smart Café)

Ce document décrit **le besoin**, **le périmètre** et **les fonctionnalités attendues**.  
Il ne détaille pas l'implémentation technique (voir **Documentation technique**) ni le mode d'emploi (voir **Guide utilisateur**).

# Présentation

## Contexte

Les collectionneurs de cartes Pokémon TCG cherchent un moyen simple de **parcourir un catalogue**, **comparer des cartes**, **acheter en ligne** et **retrouver leurs achats** dans une collection personnelle — depuis un ordinateur ou un téléphone.

## Problématique

Comment proposer une expérience d'achat claire et cohérente sur **plusieurs supports**, tout en permettant à l'équipe boutique de **gérer le catalogue et les commandes** ?

## Catalogue de cartes

Le catalogue de PokéStore est alimenté depuis l'**API officielle Pokémon TCG** (`pokemontcg.io`). Les cartes sont importées et stockées dans la base de données locale de la boutique. La boutique affiche ce catalogue local — les clients naviguent sur les données en base, pas en temps réel sur l'API externe.

## Objectifs du projet

| Objectif | Description |
|----------|-------------|
| Vendre en ligne | Parcours catalogue → panier → paiement → confirmation |
| Fidéliser | Compte client, historique des commandes, collection des cartes achetées |
| Élargir l'accès | Site web + application Android |
| Piloter la boutique | Outil admin pour le catalogue, les clients et les ventes |

# Acteurs et applications

| Acteur | Application | Rôle |
|--------|-------------|------|
| **Client / collectionneur** | Site web | Acheter, suivre commandes et collection |
| **Client / collectionneur** | Application Android | Même usage sur mobile |
| **Administrateur boutique** | Application bureau (admin) | Gérer catalogue, commandes, indicateurs |
| *(support)* | API + base de données | Sert les trois interfaces ci-dessus |

**Règle importante :** un compte **client** ne peut pas accéder à l'admin. Un compte **admin** sert uniquement à la gestion interne et ne peut pas être créé depuis l'application — les comptes administrateurs sont créés manuellement par l'équipe projet.

# Périmètre fonctionnel — site web

**Adresse :** https://pokestore-hazel.vercel.app

| Réf. | Fonctionnalité | Besoin utilisateur | Livré |
|------|----------------|-------------------|-------|
| W-01 | Page d'accueil | Découvrir la boutique et accéder rapidement au catalogue | ✅ |
| W-02 | Boutique | Consulter les cartes avec filtres (prix, série, extension, recherche textuelle) | ✅ |
| W-03 | Fiche carte | Voir le détail d'une carte avant achat | ✅ |
| W-04 | Compte client | S'inscrire et se connecter (email ou Google) | ✅ |
| W-05 | Panier | Ajouter, modifier ou retirer des cartes | ✅ |
| W-06 | Paiement | Régler la commande en ligne de façon sécurisée | ✅ |
| W-07 | Mes commandes | Consulter l'historique et le statut | ✅ |
| W-08 | Ma collection | Retrouver les cartes issues des commandes payées | ✅ |
| W-09 | Profil | Modifier ses informations personnelles | ✅ |
| W-10 | Contact | Envoyer un message à la boutique | ✅ |
| W-11 | Application mobile | Lien et QR code pour installer l'app Android | ✅ |

# Périmètre fonctionnel — application mobile Android

L'application est distribuée sous forme d'APK téléchargeable directement depuis le site PokéStore (QR code ou lien sur la page d'accueil).

| Réf. | Fonctionnalité | Besoin utilisateur | Livré |
|------|----------------|-------------------|-------|
| M-01 | Installation | Télécharger et installer l'app depuis le site (QR code) | ✅ |
| M-02 | Compte | Même compte que sur le site web | ✅ |
| M-03 | Boutique | Parcourir et filtrer le catalogue | ✅ |
| M-04 | Achat | Panier et paiement sécurisé | ✅ |
| M-05 | Commandes | Suivre ses achats | ✅ |
| M-06 | Collection | Voir ses cartes achetées | ✅ |
| M-07 | Contact | Contacter la boutique | ✅ |
| M-08 | Fond d'écran personnalisé | Générer un fond d'écran depuis une carte de sa collection | ✅ |

# Périmètre fonctionnel — application admin

Réservée aux **administrateurs** de la boutique. Application bureau Windows, installée en local.

| Réf. | Fonctionnalité | Besoin métier | Livré |
|------|----------------|---------------|-------|
| A-01 | Connexion sécurisée | Accès réservé à l'équipe | ✅ |
| A-02 | Tableau de bord | Vue d'ensemble des ventes, chiffre d'affaires, top produit et top client | ✅ |
| A-03 | Catalogue | Importer, modifier et supprimer des cartes | ✅ |
| A-04 | Clients | Consulter la liste et enregistrer une fiche client (email, nom, téléphone) — sans mot de passe, pas un compte connectable | ✅ |
| A-05 | Commandes | Consulter les commandes (lecture seule) | ✅ |
| A-06 | Pipeline commercial | Suivre les prospects et clients actifs par statut (prospect, actif, à relancer) | ✅ |
| A-07 | Relances | Voir les commandes en attente, archiver celles qui ne seront pas honorées | ✅ |

# Exigences non fonctionnelles

Le site et l'application Android ont été conçus pour être agréables à utiliser sur tout type d'écran (ordinateur, tablette, mobile), avec des messages clairs en cas d'erreur ou de succès. La navigation au clavier est fonctionnelle et les boutons sont correctement identifiés pour les lecteurs d'écran. Le catalogue se charge de manière progressive pour ne pas bloquer l'affichage. Les comptes sont protégés et le paiement est traité par un prestataire reconnu (aucune donnée bancaire ne transite par le site). L'ensemble de l'infrastructure (site, API, base de données) est hébergé sur des services cloud disponibles en permanence.

Les mesures détaillées (scores PageSpeed, tests automatisés, scores d'accessibilité) sont disponibles dans la **Documentation technique**.

# Hors périmètre (cette version)

- Application iPhone / App Store
- Livraison physique des cartes (projet numérique)
- Favoris utilisateur (modèle prévu, aucune interface ni fonctionnalité exposée)
- Mentions légales (lien présent dans le pied de page, page non réalisée)
- Création de comptes administrateur depuis l'application (seed manuel uniquement)
- Publication de l'application admin sur un store

# Livrables attendus

| Livrable | Contenu |
|----------|---------|
| Site web | Boutique en ligne en production |
| Application mobile | APK Android |
| API + base de données | Backend et persistance |
| Application admin | Outil bureau Windows |
| **Cahier des charges** | Ce document |
| **Guide utilisateur** | Mode d'emploi client et admin |
| **Documentation technique** | Architecture, API, déploiement, tests |

\pagebreak

# Annexes — aperçu visuel

*Captures d'illustration du rendu final. Format réduit pour la lecture.*

## Site web

![Accueil du site](./images/capture-v2-home-hero.png)

![Page boutique](./images/capture-v2-shop.png)

## Application mobile

![Accueil mobile](./images/capture-mobile-home.jpg)

![Boutique mobile](./images/capture-mobile-shop.jpg)

## Application admin

![Tableau de bord admin](./images/capture-electron-dashboard.png)

---

*PokéStore — Cahier des charges — Juin 2026 — Projet Ynov B3 DEV*
