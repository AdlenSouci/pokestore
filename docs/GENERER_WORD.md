# Générer le livrable Word

## Fichier produit

`docs/LIVRABLE_ORAL_FINAL_v12.docx`

## Commande

```powershell
powershell -ExecutionPolicy Bypass -File docs\scripts\generate-livrable-word.ps1
```

Le script convertit `LIVRABLE_ORAL_FINAL.md` avec Pandoc puis met à jour la table des matières dans Word (numéros de page corrects).

## Si la TOC affiche « page 1 » partout

Word → clic droit sur la table des matières → **Mettre à jour les champs** → **Mettre à jour toute la table**.

## Contenu

Éditer `docs/LIVRABLE_ORAL_FINAL.md` (état réel du projet : web, mobile, API, Electron), puis relancer le script.
