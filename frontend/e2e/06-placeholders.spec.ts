import { test } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../docs/cahier-des-charges/images');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const placeholders: Array<{
  filename: string;
  title: string;
  subtitle: string;
  hint: string;
  width: number;
  height: number;
  accent: string;
}> = [
  {
    filename: 'capture-mobile-home.png',
    title: 'Mobile · Accueil GBA',
    subtitle: 'À remplacer par un screenshot de votre téléphone',
    hint: 'Lance l\'app PokéStore → écran d\'accueil avec Pokéball + "Voir la boutique"',
    width: 540,
    height: 1100,
    accent: '#7ec8a3',
  },
  {
    filename: 'capture-mobile-collection.png',
    title: 'Mobile · Ma collection',
    subtitle: 'À remplacer par un screenshot de votre téléphone',
    hint: 'Connecte-toi → Navbar "COLLECTION" → grille des cartes achetées',
    width: 540,
    height: 1100,
    accent: '#8b7ec8',
  },
  {
    filename: 'capture-mobile-orders.png',
    title: 'Mobile · Mes commandes',
    subtitle: 'À remplacer par un screenshot de votre téléphone',
    hint: 'Connecte-toi → Icône 📦 dans la navbar → liste des commandes',
    width: 540,
    height: 1100,
    accent: '#5a4f99',
  },
  {
    filename: 'capture-admin-electron.png',
    title: 'Desktop · Admin Electron',
    subtitle: 'À remplacer par un screenshot de l\'app Electron',
    hint: 'Lance pokemon-electron → dashboard avec liste cartes + commandes',
    width: 1280,
    height: 800,
    accent: '#f9d342',
  },
];

for (const p of placeholders) {
  test(`PLACEHOLDER ${p.filename}`, async ({ page }) => {
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: ${p.width}px;
    height: ${p.height}px;
    background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 60%, #1a1f3a 100%);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
    overflow: hidden;
    position: relative;
  }
  .stamp {
    position: absolute;
    top: 20px;
    right: 20px;
    background: ${p.accent};
    color: #1a1f3a;
    padding: 8px 16px;
    border-radius: 999px;
    font-weight: 800;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    border: 2px solid #1a1f3a;
  }
  .box {
    border: 4px dashed ${p.accent};
    border-radius: 20px;
    padding: 50px 40px;
    background: rgba(0,0,0,0.25);
    max-width: 80%;
  }
  h1 {
    font-size: ${Math.round(p.width / 22)}px;
    margin: 0 0 16px;
    color: ${p.accent};
    line-height: 1.2;
  }
  h2 {
    font-size: ${Math.round(p.width / 38)}px;
    margin: 0 0 32px;
    color: #c4b5fd;
    font-weight: 500;
  }
  .hint {
    font-size: ${Math.round(p.width / 42)}px;
    background: rgba(255,255,255,0.08);
    padding: 16px 20px;
    border-radius: 12px;
    border-left: 4px solid ${p.accent};
    line-height: 1.5;
    text-align: left;
  }
  .pokeball {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(180deg, #ef4444 0%, #ef4444 48%, #1a1f3a 48%, #1a1f3a 52%, #f9fafb 52%);
    border: 4px solid #1a1f3a;
    margin: 0 auto 24px;
    position: relative;
  }
  .pokeball::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    border: 4px solid #1a1f3a;
  }
  .footer {
    position: absolute;
    bottom: 24px;
    font-size: 11px;
    opacity: 0.5;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
  <div class="stamp">À fournir</div>
  <div class="box">
    <div class="pokeball"></div>
    <h1>${p.title}</h1>
    <h2>${p.subtitle}</h2>
    <div class="hint">${p.hint}</div>
  </div>
  <div class="footer">PokéStore · Livrable oral B3 DEV</div>
</body>
</html>`;

    await page.setViewportSize({ width: p.width, height: p.height });
    await page.setContent(html, { waitUntil: 'load' });
    await page.screenshot({
      path: path.join(OUT, p.filename),
      fullPage: false,
      clip: { x: 0, y: 0, width: p.width, height: p.height },
    });
  });
}
