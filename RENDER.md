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

Colle la même `DATABASE_URL` que dans ton `.env` local (Neon pooler, avec `channel_binding` si Neon te la donne comme ça).

Si le deploy échoue encore sur la DB : essaie la connexion **Direct** dans Neon (autre host, sans `-pooler`).

## Autres variables

Colle tout ton `backend/.env` (Add from .env), puis change :

- `GOOGLE_CALLBACK_URL` = `https://TON-SERVICE.onrender.com/api/auth/google/callback`
- Même URL dans Google Cloud Console → OAuth → Redirect URIs

## Après deploy

Test : `https://TON-SERVICE.onrender.com/api/health` → doit afficher `{"ok":true}`
