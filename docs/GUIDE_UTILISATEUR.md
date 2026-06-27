---
title: "Guide utilisateur — PokéStore"
subtitle: "Web et application mobile"
author: "[Équipe PokéStore]"
date: "Juin 2026"
lang: fr-FR
toc-title: "Table des matières"
---

Guide pas à pas pour les **clients** (acheteurs / collectionneurs).

# Partie A — Site web

**Adresse :** https://pokestore-hazel.vercel.app

### A1. Créer un compte

1. Cliquez sur **Connexion** ou **Inscription** dans la barre de navigation.
2. Remplissez email et mot de passe, ou utilisez **Continuer avec Google**.
3. Un message de confirmation s’affiche (toast vert).

### A2. Acheter une carte

1. Cliquez sur **Boutique** (ou le CTA sur l’accueil).
2. Utilisez les **filtres** (prix, type, série…) ou la recherche.
3. Cliquez sur une carte pour voir le **détail**.
4. Cliquez sur **Ajouter au panier**.
5. Ouvrez le **panier** (icône en haut).
6. Cliquez sur **Commander** → vous serez invité à vous connecter si besoin.
7. Suivez le **paiement Stripe** (carte test en démo : `4242 4242 4242 4242`).

![Boutique — filtres et catalogue](./cahier-des-charges/images/capture-v2-shop.png)

### A3. Voir ses commandes

1. Connectez-vous.
2. Cliquez sur l’icône **commandes** (colis).
3. Consultez la liste et le détail de chaque commande.

### A4. Ma collection

1. Menu **Collection** dans la navigation.
2. Toutes les cartes des commandes **payées** s’affichent.
3. Le badge **×2**, **×3**… indique plusieurs exemplaires.

### A5. Contacter la boutique

1. Allez sur **Contact**.
2. Remplissez le formulaire.
3. Répondez au **captcha** (calcul simple).
4. Cliquez **Envoyer**.

### A6. Modifier son profil

1. Cliquez sur l’icône **profil**.
2. Modifiez nom, téléphone ou mot de passe.

![Inscription](./cahier-des-charges/images/capture-v2-auth-signup.png)

# Partie B — Application mobile

**Installation :** APK fourni par l’équipe, ou Expo Go en test.

### B1. Première ouverture

1. Lancez l’application **PokéStore**.
2. L’écran d’accueil propose d’aller à la **Boutique**.

![Accueil mobile](./cahier-des-charges/images/capture-mobile-home.png)

### B2. Navigation

- Menu **☰** (hamburger) : Accueil, Boutique, Collection, Commandes, Contact, Connexion.
- Icône **panier** : accès rapide au panier.

### B3. Acheter (même logique que le web)

1. **Boutique** → choisir une carte → **Ajouter au panier**.
2. **Panier** → **Commander** → connexion si nécessaire.
3. Paiement **Stripe** dans le navigateur intégré.
4. Après paiement : **Mes commandes** ou **Ma collection**.

![Collection mobile](./cahier-des-charges/images/capture-mobile-collection.png)

![Commandes mobile](./cahier-des-charges/images/capture-mobile-orders.png)

### B4. Connexion Google (mobile)

1. Écran **Connexion** ou **Inscription**.
2. **Continuer avec Google**.
3. Autorisez dans le navigateur → retour automatique dans l’app.

### B5. Dépannage

| Problème | Solution |
|----------|----------|
| Catalogue vide ou lent | Attendre 30–60 s (serveur qui se réveille) puis réessayer |
| Google ne revient pas dans l’app | Vérifier que l’APK récent est installé |
| Erreur réseau | Vérifier Wi‑Fi / 4G |

---

## Partie C — Rappels importants

- Un seul compte pour **web** et **mobile** (même email).
- La **collection** ne contient que les cartes **payées**.
- En cas de problème de paiement : utiliser **Contact** ou relancer depuis le panier.

---

*Guide utilisateur — PokéStore — Juin 2026*
