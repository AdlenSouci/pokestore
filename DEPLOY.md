# Mise en ligne gratuite (PokéStore)

| Composant | Hébergeur | Déjà fait ? |
|-----------|-----------|-------------|
| Base PostgreSQL | **Neon** | Oui (DATABASE_URL) |
| API NestJS | **Render** (gratuit) | À faire |
| Site React | **Vercel** (gratuit) | À faire |
| App mobile | **Expo** sur ton téléphone | Pointe vers l’API Render |

La partie mobile n’a pas besoin d’un hébergeur séparé : elle appelle l’API comme le site.

---

## 1. Backend sur Render

1. Va sur [render.com](https://render.com) → connecte-toi avec **GitHub**.
2. **New** → **Blueprint** → choisis le repo `AdlenSouci/pokestore`.
3. Render lit `render.yaml` à la racine. Valide le déploiement.
4. Dans le service **pokestore-api** → **Environment** → ajoute les variables (copie depuis ton `backend/.env` local) :
   - `DATABASE_URL` → URL Neon (déjà la tienne)
   - `JWT_SECRET`, `GOOGLE_*`, `MAIL_*`, `STRIPE_*`
   - `FRONTEND_URL` → tu la mettras à jour après Vercel (ex. `https://pokestore.vercel.app`)
   - `GOOGLE_CALLBACK_URL` → `https://TON-API.onrender.com/api/auth/google/callback`
5. Attends le déploiement. Note l’URL : `https://pokestore-api.onrender.com` (le nom peut varier).

Dans [Google Cloud Console](https://console.cloud.google.com) → OAuth → ajoute cette URL de callback.

**Stripe** (si tu l’utilises) : webhook → `https://TON-API.onrender.com/api/stripe/webhook`

---

## 2. Frontend sur Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → importe `pokestore` depuis GitHub.
2. **Root Directory** : `frontend`
3. **Environment Variable** :
   - `VITE_API_URL` = `https://TON-API.onrender.com/api` (sans slash final)
4. Déploie. Note l’URL du site (ex. `https://pokestore.vercel.app`).

Retourne sur **Render** → mets à jour `FRONTEND_URL` avec l’URL Vercel → **Redeploy**.

---

## 3. App mobile (Expo)

Dans `mobile-rn/.env` (ne pas commit) :

```env
EXPO_PUBLIC_API_URL=https://TON-API.onrender.com/api
```

Puis :

```bash
cd mobile-rn
npx expo start
```

Sur téléphone : même Wi‑Fi ou Expo Go avec cette URL.

---

## Limites du gratuit

- **Render** : le serveur s’endort après ~15 min sans trafic → premier chargement lent (~30 s).
- **Neon** : quota de stockage / connexions sur le plan free.

---

## Pousser les fichiers de déploiement sur GitHub

```powershell
cd C:\Users\adlen\Desktop\pokemon-app
git add render.yaml frontend/vercel.json DEPLOY.md backend/.env.example frontend/.env.example backend/src/main.ts backend/package.json
git commit -m "Config deploiement Render et Vercel"
git push origin main
```

Ensuite refais l’étape Blueprint sur Render si le repo était déjà connecté.
