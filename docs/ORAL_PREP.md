# Préparation oral — UF DEV B3

> **Oral final : 20 min** — grille ci-dessous (coef. technique **3**)  
> **Oral intermédiaire : 10 min** — surtout transversal (coef. **1**)  
> Projet : **PokéStore** (sujet libre = mêmes exigences que Smart Café)

---

## GRILLE ORAL FINAL — ce que le jury note vraiment

C’est la grille de ton capture d’écran. **Plus la pondération est haute, plus tu dois le montrer à l’oral.**

### Compétences transverses (aussi évaluées sur le projet)

| Critère | Pond. | Ce que tu prouves avec PokéStore |
|---------|-------|----------------------------------|
| **Git / GitHub** (versioning, branches, commits, PR) | **3** | Repo `github.com/AdlenSouci/pokestore`, historique commits |
| **Gérer le projet** (Trello, Notion, ClickUp…) | **4** | `task.md`, découpage phases — *si vous avez Notion/Trello, mentionne-le* |
| **Rédiger des spécifications** | **5** | Livrable v12 + doc fonctionnelle/technique + Swagger |
| **Présenter à l’oral** | **5** | Démo structurée 20 min — cette fiche |
| **Posture professionnelle** (autonomie, rigueur, livrables) | **3** | Projet en prod, doc rendue, honnêteté sur limites |

### Compétences générales — oral final 20 min

| Critère | Pond. | Module | Tu dis / tu montres |
|---------|-------|--------|---------------------|
| **Concevoir une solution répondant à un besoin métier** | **4** | — | « Collectionneurs veulent acheter + suivre leurs cartes » → parcours Accueil → Boutique → Panier → Collection |
| **App web fonctionnelle avec framework** | **8** | Web front avancé | **React 19 + Vite** — démo live boutique, auth, panier, Stripe, collection, contact |
| **Interfaces responsives + accessibles** (WCAG, ARIA, W3C) | **2** | Web front avancé | Tailwind responsive + `aria-label` + PageSpeed a11y **98** |
| **Bonnes pratiques conception** (modularité, SOLID…) | **3** | Bonne pratique conception | NestJS modules/services ; front = Pages + components + services |
| **BDD relationnelle / NoSQL** (modèle + requêtes optimisées) | **3** | Admin BDD, NoSQL | **PostgreSQL + Prisma** — `schema.prisma`, index, pagination `/api/cards` |
| **Interface mobile Android / iOS** | **8** | Développement mobile | **Expo RN** — démo tel : boutique, collection, commandes, Google, Stripe |
| **Interfaces intuitives / UX** | **2** | Web + mobile | Toasts, loaders, parcours clair, thème cohérent |

**Priorité temps oral :** web (**8**) + mobile (**8**) = **~12 min de démo**. Le reste en parlant + Swagger + livrable.

---

## 1. Livrables obligatoires (sujet libre) — quoi montrer

| Exigence PDF | Ton projet | Preuve à montrer à l’oral |
|--------------|------------|---------------------------|
| Application web | `frontend/` React + Vite | https://pokestore-hazel.vercel.app |
| Backend structuré et **sécurisé** | `backend/` NestJS | Swagger + mention JWT, Helmet, throttler, ADMIN |
| Base de données SQL | PostgreSQL Neon + Prisma | Schéma Prisma, relations User / Order / Card |
| Application mobile | `mobile-rn/` Expo + APK EAS | Téléphone ou captures collection / commandes |
| Doc fonctionnelle + technique | `docs/LIVRABLE_ORAL_FINAL_v12.docx` | « Le livrable décrit parcours, archi, API, tests » |

**Phrase d’ouverture type :**  
« On a choisi un sujet libre — boutique Pokémon — mais on couvre les mêmes briques que le Smart Café : web, API sécurisée, SQL et mobile, avec la doc livrée. »

---

## 2. Grille compétences — ce que le jury évalue

Pour chaque ligne : **niveau visé**, **quoi dire**, **quoi montrer**.

Légende niveaux PDF : Non acquis → En cours → Partiellement → **Acquis** → Maîtrisé

---

### Frontend & UX

| Compétence PDF | Niveau | Tu dis | Tu montres |
|----------------|--------|--------|------------|
| Application web framework moderne | **Acquis → Maîtrisé** | React 19, Vite, composants typés, services API | Boutique live, routing `/shop`, `/collection` |
| UI multi-supports (desktop, tablette, mobile) | **Acquis** | Tailwind responsive, menu hamburger ; app native Expo | Redimensionne navigateur OU captures audit-css ; mobile sur tel |
| Normes d’accessibilité | **Acquis** | `aria-label` sur icônes/modales, focus visible | PageSpeed a11y **98** + clic panier avec lecteur d’écran si question |
| Performances / temps de chargement | **Acquis** | Lazy-loading images, pagination API, pas tout charger d’un coup | PageSpeed perf **99** desktop, **83** mobile — capture livrable |
| Feedbacks clairs (erreurs, toasts, loaders) | **Acquis** | react-hot-toast, spinners connexion/panier, erreurs dans modales auth | Ajout panier → toast ; mauvais mdp → message clair |
| Concevoir interfaces UI/UX | **Acquis** | Thème Pokémon rétro, parcours Accueil → Boutique → Panier cohérent | Hero + modal carte + collection |

---

### Backend & sécurité

| Compétence PDF | Niveau | Tu dis | Tu montres |
|----------------|--------|--------|------------|
| Architecture backend orientée services | **Maîtrisé** | NestJS : Modules / Controllers / Services / DTO | Swagger : auth, cards, cart, orders, contact |
| Structurer le code (bonnes pratiques) | **Acquis** | Un module par domaine (`auth`, `cards`, `cart`…) | Arborescence `backend/src/` si question |
| Auth & autorisation sécurisés | **Acquis** | JWT, bcrypt, Google OAuth, guards sur routes protégées | `GET /cart` sans token → 401 ; login → token |
| Protéger les endpoints (vulnérabilités) | **Acquis** | Helmet, throttler, validation DTO, CORS, rôle ADMIN | « import/reprice réservés admin » + `AdminGuard` |
| SOLID / DRY / KISS | **Partiellement → Acquis** | Services injectés, pas de logique métier dans les controllers | Exemple : `OrdersService` + `StripeService` séparés |

---

### Base de données

| Compétence PDF | Niveau | Tu dis | Tu montres |
|----------------|--------|--------|------------|
| Modèle de données (entités) | **Acquis** | User, PokemonCard, Cart, Order, relations Prisma | `schema.prisma` ou schéma dans livrable |
| Requêtes SQL / ORM API ↔ BDD | **Acquis** | Prisma Client, migrations versionnées | Filtres boutique = requêtes avec `where`, index sur price/year |
| Optimiser la BDD | **Partiellement acquis** | Index sur prix, année, série ; pagination | `@@index` dans schema + `pageSize` sur `/api/cards` |

---

### Mobile

| Compétence PDF | Niveau | Tu dis | Tu montres |
|----------------|--------|--------|------------|
| Application Android et/ou iOS | **Acquis** | Expo SDK 54, APK EAS, même API que le web | App : boutique, collection, commandes, Stripe, Google |

---

### Transversal (oral intermédiaire coef. 1 — 10 min)

| Compétence PDF | Niveau | Tu dis | Tu montres |
|----------------|--------|--------|------------|
| Versionner son code (Git) | **Acquis** | GitHub `AdlenSouci/pokestore`, commits réguliers | Repo si demandé |
| Collaborer en équipe | **[À compléter]** | GitHub, qui a fait quoi (front/back/mobile) | Prépare 1 phrase par personne |
| Gérer le projet (planning) | **Partiellement** | `task.md`, phases dans CDC initial | « On a priorisé API puis web puis mobile » |
| Documentation fonctionnelle + technique | **Acquis** | Livrable v12 + Swagger + README | Document Word |
| Présenter et valoriser à l’oral | **À toi** | Démo live + structure claire | Ce fichier |

---

## 3. Déroulé 20 min — calé sur les pondérations

| Min | Bloc | Pond. visée |
|-----|------|-------------|
| 0–2 | Besoin métier + solution | **4** besoin métier |
| 2–8 | **Démo web React** (boutique, panier, auth, collection) | **8** web + **2** UX + **2** a11y |
| 8–13 | **Démo mobile Expo** | **8** mobile + **2** UX |
| 13–15 | BDD Prisma + bonnes pratiques code | **3** BDD + **3** conception |
| 15–17 | Swagger API (backend = support du web/mobile) | renforce web + mobile |
| 17–18 | Livrable + specs + Git | **5** spécifications + **3** Git |
| 18–20 | Bilan, limites, questions | **5** oral + **3** posture pro |

---

## 4. Scripts courts par bloc

### A — Intro (2 min)
« PokéStore : e-commerce cartes Pokémon. Sujet libre validé par le PDF : web, backend sécurisé, PostgreSQL, mobile Expo, documentation. Trois clients — site, app, admin Electron — une API NestJS sur Render. »

### B — Démo web (5 min)
Accueil → Boutique + filtre → Détail carte → Panier + toast → Collection (connecté) → *(option)* Contact

### C — Démo mobile (3 min)
Même API → Collection / Commandes → « Parité fonctionnelle avec le web »

### D — Technique jury (4 min)
1. Swagger `/api/docs` — modules
2. « JWT sur panier/commandes, ADMIN sur import »
3. Schéma Prisma — User, Order, PokemonCard
4. « 7 Jest + 7 Playwright, PageSpeed 99/98 desktop »

### E — Clôture (1 min)
« Projet en prod Vercel + Render + Neon. Limite : cold start Render. Suite : fond d’écran IA depuis la collection. »

---

## 5. Questions jury ↔ compétences PDF

| Question probable | Réponse (30 s max) | Compétence |
|-------------------|-------------------|------------|
| Pourquoi sujet libre ? | Mêmes compétences Smart Café, domaine qui nous motive | Cadrage PDF |
| Montrez la sécurité | JWT, bcrypt, guards, Helmet, throttler, admin séparé | Protéger endpoints |
| Où est le SQL ? | PostgreSQL Neon ; Prisma génère les requêtes ; migrations Git | SQL / ORM |
| Responsive ? | Tailwind breakpoints + app native mobile | Multi-supports |
| Accessibilité ? | aria-label, PageSpeed a11y 98, contrastes thème | Accessibilité |
| Performances ? | Pagination, lazy images, PageSpeed 99 desktop | Perf frontend |
| Erreurs utilisateur ? | Toasts, messages auth, loaders | Feedbacks |
| Architecture back ? | NestJS modules/services, un domaine = un module | Archi services |
| Mobile = même code web ? | Non, React Native, **même API REST** | Mobile |
| Travail en équipe ? | **[Prépare]** Git, répartition tâches | Transversal |
| Documentation ? | Livrable Word + Swagger + README | Doc |
| Tests ? | Jest unitaires + Playwright E2E prod | Qualité |

---

## 6. Honnêteté — points « partiellement acquis » (si on te challenge)

| Sujet | Réponse honnête |
|-------|-----------------|
| Electron pas sur Git | Bonus perso, gitignored, pas exigé par le PDF |
| Render lent | Plan gratuit, cold start — solution : payant ou keep-alive |
| Favoris en BDD | Modèle Prisma prêt, UI pas encore faite |
| SOLID poussé | On applique injection et séparation modules ; pas de sur-architecture |

Ne dis pas « tout est parfait » — le PDF valorise l’**honnêteté** sur les manques.

---

## 7. Oral intermédiaire 10 min (si rappel)

Focus **transversal** coef. 1 : organisation équipe, Git, planning, communication, état d’avancement mi-projet.  
Moins de démo technique — plus « comment on a découpé le projet, qui fait quoi, où on en est ».

---

## 8. Checklist veille de soutenance

- [ ] Livrable Word v12 — prénoms promo sur la garde
- [ ] Site + API ouverts (réveil Render)
- [ ] Compte test connecté pour collection
- [ ] Téléphone chargé (Expo ou APK)
- [ ] Swagger dans un onglet
- [ ] Cette fiche + livrable sur clé USB / cloud

---

## 9. Une page à retenir (ultra condensé)

```
PONDÉRATIONS : Web 8 + Mobile 8 → le cœur de la démo
MÉTIER (4)    : Collectionneurs → catalogue + achat + suivi collection
WEB (8)       : React Vite — boutique → filtre → panier → toast → collection
MOBILE (8)    : Expo — même API, collection + commandes
A11Y (2)      : aria-label, PageSpeed a11y 98
UX (2)        : toasts, loaders, parcours fluide
BDD (3)       : Prisma, User/Order/Card, index + pagination
CONCEPTION (3): modules NestJS, services séparés
SPECS (5)     : Livrable v12 + Swagger
ORAL (5)      : 20 min structurées, démo live
GIT (3)       : github.com/AdlenSouci/pokestore
```

---

*Aligné sur `UF_DEV_B3` — grille identique Smart Café / sujet libre.*
