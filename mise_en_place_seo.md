# Mise en place du SEO — PokéCard Store

> Date : 20 mars 2026  
> Projet : `pokemon-app` (React 19 + Vite / NestJS)

---

## Contexte

Le projet est une **Single Page Application (SPA)** React/Vite sans React Router (la navigation est gérée par un `useState` dans [App.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/App.tsx)). Par défaut, une SPA n'expose aucun meta tag exploitable par les moteurs de recherche. L'objectif de cette mise en place était d'implémenter un SEO **complet et production-grade** sans changer l'architecture existante.

---

## Ce qui a été fait

### 1. Installation de `react-helmet-async`

La librairie `react-helmet-async` permet de gérer dynamiquement le contenu de `<head>` (titre, meta tags…) depuis n'importe quel composant React.

```bash
npm install react-helmet-async
```

**Preuve — [package.json](file:///c:/Users/adlen/Desktop/pokemon-app/backend/package.json) :**
```json
"dependencies": {
  "react-helmet-async": "^2.x.x",
  ...
}
```

---

### 2. Création du composant [SEO.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/components/SEO.tsx)

**Fichier :** [src/components/SEO.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/components/SEO.tsx)

Un composant réutilisable qui centralise toute la logique SEO. Il suffit de le placer dans n'importe quelle page et de lui passer les props nécessaires.

**Ce qu'il génère :**
| Balise | Rôle |
|---|---|
| `<title>` | Titre affiché dans l'onglet et dans Google |
| `<meta name="description">` | Description dans les résultats de recherche |
| `<link rel="canonical">` | Évite le duplicate content |
| `<meta property="og:*">` | Prévisualisation sur Facebook, LinkedIn, WhatsApp |
| `<meta name="twitter:*">` | Prévisualisation sur Twitter/X |
| `<script type="application/ld+json">` | Données structurées Schema.org (rich snippets Google) |

```tsx
// src/components/SEO.tsx
import { Helmet } from 'react-helmet-async';

export function SEO({ title, description, image, url, type, jsonLd }: SEOProps) {
  const fullTitle = title ? `${title} | PokéCard Store` : `PokéCard Store – Cartes Pokémon rares`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Schema.org */}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
```

---

### 3. Mise à jour de [index.html](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/index.html)

**Fichier :** [index.html](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/index.html)

L'[index.html](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/index.html) sert de **fallback statique** (robots d'indexation qui ne lisent pas le JS, partages réseaux sociaux sans JS, etc.).

**Avant :**
```html
<html lang="en">
  <title>frontend</title>
```

**Après :**
```html
<html lang="fr">
  <!-- Favicon Pokéball SVG -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,..." />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <meta name="theme-color" content="#2d3561" />

  <!-- SEO fallback statique -->
  <title>PokéCard Store – Cartes Pokémon rares</title>
  <meta name="description" content="Achetez et collectionnez les meilleures cartes Pokémon rares en ligne." />
  <meta name="robots" content="index, follow" />

  <!-- Open Graph fallback -->
  <meta property="og:title" content="PokéCard Store – Cartes Pokémon rares" />
  <meta property="og:locale" content="fr_FR" />

  <!-- Préchargement polices -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
```

---

### 4. Activation dans [main.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/main.tsx)

**Fichier :** [src/main.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/main.tsx)

`HelmetProvider` doit envelopper toute l'application pour que `react-helmet-async` fonctionne.

```tsx
// Avant
<React.StrictMode>
  <App />
</React.StrictMode>

// Après
<React.StrictMode>
  <HelmetProvider>      {/* ← ajouté */}
    <App />
  </HelmetProvider>
</React.StrictMode>
```

---

### 5. SEO sur la page d'accueil

**Fichier :** [src/Pages/Home/HomePage.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/Pages/Home/HomePage.tsx)

Schéma JSON-LD **`WebSite`** avec `SearchAction` pour indiquer à Google qu'il existe une fonctionnalité de recherche.

```tsx
<SEO
  title="Accueil"
  description="PokéCard Store – Achetez et collectionnez les meilleures cartes Pokémon rares en ligne."
  url="https://pokecardstore.com"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PokéCard Store',
    url: 'https://pokecardstore.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://pokecardstore.com/shop?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }}
/>
```

> Le titre dans l'onglet du navigateur devient : **`Accueil | PokéCard Store`**

---

### 6. SEO sur la boutique

**Fichier :** [src/Pages/Shop.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/Pages/Shop.tsx)

Schéma JSON-LD **`ItemList`** qui expose le catalogue de cartes aux moteurs de recherche. La description est **dynamique** et se met à jour selon le nombre de cartes chargées depuis l'API.

```tsx
<SEO
  title="Boutique – Cartes Pokémon rares"
  description={`Parcourez notre catalogue de ${products.length} cartes Pokémon rares...`}
  url="https://pokecardstore.com/shop"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Catalogue de cartes Pokémon',
    numberOfItems: products.length,
    itemListElement: products.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  }}
/>
```

> Le titre dans l'onglet devient : **`Boutique – Cartes Pokémon rares | PokéCard Store`**

---

### 7. [robots.txt](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/public/robots.txt)

**Fichier :** [public/robots.txt](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/public/robots.txt)

Indique aux robots quelles pages indexer et où trouver le sitemap.

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://pokecardstore.com/sitemap.xml
```

> Accessible via : `https://pokecardstore.com/robots.txt`

---

### 8. [sitemap.xml](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/public/sitemap.xml)

**Fichier :** [public/sitemap.xml](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/public/sitemap.xml)

Plan du site XML soumis à Google Search Console pour une indexation optimale.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pokecardstore.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <lastmod>2026-03-20</lastmod>
  </url>
  <url>
    <loc>https://pokecardstore.com/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>2026-03-20</lastmod>
  </url>
</urlset>
```

> Accessible via : `https://pokecardstore.com/sitemap.xml`

---

## Récapitulatif des fichiers modifiés / créés

| Fichier | Type | Description |
|---|---|---|
| [src/components/SEO.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/components/SEO.tsx) | 🆕 Créé | Composant réutilisable (meta, OG, Twitter, JSON-LD) |
| [index.html](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/index.html) | ✏️ Modifié | `lang=fr`, titre, meta, OG fallback, favicon, theme-color |
| [src/main.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/main.tsx) | ✏️ Modifié | Ajout `<HelmetProvider>` |
| [src/Pages/Home/HomePage.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/Pages/Home/HomePage.tsx) | ✏️ Modifié | `<SEO>` + schema `WebSite` |
| [src/Pages/Shop.tsx](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/src/Pages/Shop.tsx) | ✏️ Modifié | `<SEO>` + schema `ItemList` dynamique |
| [public/robots.txt](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/public/robots.txt) | 🆕 Créé | Directives pour les robots d'indexation |
| [public/sitemap.xml](file:///c:/Users/adlen/Desktop/pokemon-app/frontend/public/sitemap.xml) | 🆕 Créé | Plan du site pour Google Search Console |

---

## Comment vérifier

### Dans le navigateur
1. Lancer le frontend : `npm run dev` dans le dossier `frontend/`
2. Ouvrir **DevTools → Elements → `<head>`**
3. Vérifier la présence de :
   - `<title>Accueil | PokéCard Store</title>`
   - `<meta name="description" ...>`
   - `<meta property="og:title" ...>`
   - `<script type="application/ld+json">...</script>`
4. Naviguer vers la boutique → le titre doit changer en `Boutique – Cartes Pokémon rares | PokéCard Store`

### Outils SEO en ligne (après déploiement)
| Outil | URL | Quoi vérifier |
|---|---|---|
| Google Rich Results | [search.google.com/test/rich-results](https://search.google.com/test/rich-results) | JSON-LD Schema.org |
| Open Graph Debugger | [developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/) | OG tags / aperçu réseaux sociaux |
| Twitter Card Validator | [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator) | Aperçu Twitter/X |
| Google Search Console | [search.google.com/search-console](https://search.google.com/search-console) | Soumettre le sitemap |
