::: {align=center}

![](cahier-des-charges/images/logo.png){width=5.5cm}

&nbsp;

**Méthodologie utilisateur**

*Parcours web, mobile et admin*

*Juin 2026 — Projet Ynov B3 DEV*

:::

\pagebreak

\toc

\pagebreak
Comment **utiliser** PokéStore au quotidien. Pour l’architecture et l’API, voir la **Documentation technique**.

**Site web :** https://pokestore-hazel.vercel.app  
**Mobile :** APK Android fourni par l’équipe

---

# Site web — parcours client

## Créer un compte

1. Ouvrir le site.
2. Cliquer **Connexion** ou **Inscription**.
3. Remplir email et mot de passe, ou **Continuer avec Google**.
4. Un message vert confirme la connexion.

## Parcourir la boutique

1. Cliquer **Boutique** dans le menu.
2. Utiliser les **filtres** (prix, type, série…) ou la recherche.
3. Cliquer sur une carte pour voir le détail.

## Acheter une carte

**Ajouter au panier** — Sur la fiche carte, cliquer **Ajouter au panier**. Répéter pour d’autres cartes.

**Ouvrir le panier** — Icône panier en haut → vérifier les quantités → **Commander**.

**Se connecter** — Obligatoire pour payer (inscription ou connexion si visiteur).

**Payer avec Stripe** — Redirection vers la page Stripe (sécurisée). En mode test : carte `4242 4242 4242 4242`, date future, CVC `123`. Valider → retour sur **Mes commandes**.

**Vérifier** — Commande en statut **Payée** → cartes visibles dans **Ma collection**.

## Profil et contact

**Profil** — Icône profil → modifier nom, téléphone ou mot de passe.

**Contact** — Page Contact → remplir le formulaire → répondre au captcha → **Envoyer**.

Les emails partent via **Resend** (voir doc technique : Render bloque le SMTP classique, Resend passe en HTTPS).

---

# Application mobile — parcours client

## Première ouverture

Installer l’APK, lancer **PokéStore**, accéder à la **Boutique** depuis l’accueil.

## Boutique et achat

**Boutique** → filtres → choisir une carte → **Ajouter au panier** → **Panier** → **Commander**.

**Paiement Stripe** dans le navigateur du téléphone (même carte test `4242…`).

Puis vérifier **Mes commandes** et **Ma collection**.

## Fond d’écran IA — pas fait

Le bouton est dans l’app mais **la génération ne marche pas** (quota API Google Gemini dépassé). À faire plus tard.

## Dépannage

| Problème | Solution |
|----------|----------|
| Catalogue lent ou vide | Attendre 30–60 s (serveur Render en veille) |
| Paiement annulé | Relancer depuis le panier |
| Google ne revient pas | Réinstaller l’APK récent |

---

# Application admin — réservée aux administrateurs

> **Important :** cette application n’est **pas** pour les clients. Seuls les comptes avec le rôle **`ADMIN`** peuvent se connecter. Un compte client (`USER`) du site web ou du mobile **ne fonctionne pas** ici.

**Installation :** installateur Windows `pokemon-electron` (fourni séparément).

**Connexion :** email et mot de passe du compte **admin** (créé via `npm run db:seed:admin` ou par un autre admin). Pas de Google OAuth sur l’admin.

| Action | Comment |
|--------|---------|
| Voir les ventes | Dashboard après connexion admin |
| Importer des cartes | Module Pokemon Cards → 10 / 20 / 50 cartes |
| Suivre les commandes | Module Orders |
| Gérer les clients | Module Clients |

---

# Recette de validation (livraison)

| Scénario | OK |
|----------|-----|
| S’inscrire sur le web | ☐ |
| Acheter 2 cartes (Stripe test) | ☐ |
| Voir commande payée + collection | ☐ |
| Même compte sur mobile | ☐ |
| Envoyer un message contact | ☐ |
| Admin : importer 10 cartes | ☐ |
| Admin : dashboard + commandes | ☐ |

Signature client : _________________ Date : _________

---

# Annexes visuelles

## Site web

::: {align=center}
![Inscription](./cahier-des-charges/images/capture-v2-auth-signup.png){width=14cm}
:::


::: {align=center}
![Boutique](./cahier-des-charges/images/capture-v2-shop.png){width=14cm}
:::


::: {align=center}
![Paiement Stripe](./cahier-des-charges/images/capture-mobile-stripe.jpg){width=14cm}
:::


::: {align=center}
![Réception email Gmail](./cahier-des-charges/images/gmail.jpg){width=14cm}
:::


## Application mobile

::: {align=center}
![Accueil mobile](./cahier-des-charges/images/capture-mobile-home.jpg){width=14cm}
:::


::: {align=center}
![Boutique mobile](./cahier-des-charges/images/capture-mobile-shop.jpg){width=14cm}
:::


::: {align=center}
![Détail carte](./cahier-des-charges/images/capture-mobile-card.jpg){width=14cm}
:::


::: {align=center}
![Stripe mobile](./cahier-des-charges/images/capture-mobile-stripe.jpg){width=14cm}
:::


## Application admin

::: {align=center}
![Dashboard admin](./cahier-des-charges/images/capture-electron-dashboard.png){width=14cm}
:::


---

*Méthodologie utilisateur — PokéStore — Juin 2026*
