# Render — backend pokestore (checklist)

## Création du service

- **Type** : Web Service
- **Repo** : `AdlenSouci/pokestore`
- **Root Directory** : `backend`
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm run start:prod`
- **Instance** : Free

## Variable obligatoire (Neon)

Dans Render → Environment, `DATABASE_URL` **exactement** comme dans Neon (onglet **Connection string**).

**Important** : enlève `&channel_binding=require` à la fin si présent.

Si le deploy échoue encore sur la DB : dans Neon, prends la connexion **Direct** (pas Pooled) et colle-la dans `DATABASE_URL` sur Render.

## Autres variables

Colle tout ton `backend/.env` (Add from .env), puis change :

- `GOOGLE_CALLBACK_URL` = `https://TON-SERVICE.onrender.com/api/auth/google/callback`
- Même URL dans Google Cloud Console → OAuth → Redirect URIs

## Après deploy

Test : `https://TON-SERVICE.onrender.com/api/health` → doit afficher `{"ok":true}`
