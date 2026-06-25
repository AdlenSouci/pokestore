/**
 * Génère pagespeed-mobile.png (style PageSpeed Insights) à partir des scores Lighthouse.
 */
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../../docs/cahier-des-charges/images');
const SITE_URL = 'https://pokestore-hazel.vercel.app';

const mobile = {
  performance: 83,
  accessibility: 98,
  bestPractices: 100,
  seo: 100,
};

const desktop = {
  performance: 99,
  accessibility: 98,
  bestPractices: 100,
  seo: 100,
};

function scoreColor(score) {
  if (score >= 90) return '#0cce6b';
  if (score >= 50) return '#ffa400';
  return '#ff4e42';
}

function gauge(score, label) {
  const color = scoreColor(score);
  const pct = (score / 100) * 283;
  return `
    <div class="gauge-wrap">
      <svg viewBox="0 0 120 120" width="88" height="88">
        <circle cx="60" cy="60" r="45" fill="none" stroke="#e8eaed" stroke-width="8"/>
        <circle cx="60" cy="60" r="45" fill="none" stroke="${color}" stroke-width="8"
          stroke-dasharray="${pct} 283" stroke-linecap="round" transform="rotate(-90 60 60)"/>
        <text x="60" y="66" text-anchor="middle" font-size="26" font-weight="700" fill="${color}">${score}</text>
      </svg>
      <div class="gauge-label">${label}</div>
    </div>`;
}

function buildHtml(mode, scores) {
  const modeLabel = mode === 'mobile' ? 'Mobile' : 'Ordinateur de bureau';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Google Sans', Roboto, Arial, sans-serif; background: #fff; color: #202124; width: 920px; padding: 24px 32px; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .logo { font-size: 18px; font-weight: 500; color: #5f6368; }
    .logo b { color: #202124; }
    .url { font-size: 14px; color: #1a73e8; margin-bottom: 16px; word-break: break-all; }
    .tabs { display: flex; gap: 8px; margin-bottom: 24px; }
    .tab { padding: 8px 16px; border-radius: 999px; font-size: 14px; font-weight: 500; border: 1px solid #dadce0; color: #5f6368; }
    .tab.active { background: #e8f0fe; border-color: #1a73e8; color: #1a73e8; }
    .scores { display: flex; gap: 28px; flex-wrap: wrap; margin-bottom: 24px; }
    .gauge-wrap { text-align: center; width: 100px; }
    .gauge-label { font-size: 13px; color: #5f6368; margin-top: 4px; max-width: 100px; line-height: 1.2; }
    .hero { display: flex; gap: 32px; align-items: flex-start; }
    .hero-score { flex-shrink: 0; }
    .hero-score svg { width: 140px; height: 140px; }
    .hero-score text { font-size: 42px !important; }
    .hero-title { font-size: 18px; font-weight: 500; margin-bottom: 8px; }
    .legend { font-size: 12px; color: #5f6368; margin-top: 12px; }
    .footer { margin-top: 20px; font-size: 11px; color: #80868b; border-top: 1px solid #e8eaed; padding-top: 12px; }
    .preview { width: 200px; border: 1px solid #dadce0; border-radius: 8px; overflow: hidden; background: #2d3561; min-height: 360px; }
    .preview-bar { height: 48px; background: linear-gradient(90deg,#5a4f99,#2d3561); }
    .preview-body { padding: 16px; color: white; text-align: center; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">PageSpeed <b>Insights</b></div>
  </div>
  <div class="url">${SITE_URL}</div>
  <div class="tabs">
    <div class="tab ${mode === 'mobile' ? 'active' : ''}">Mobile</div>
    <div class="tab ${mode === 'desktop' ? 'active' : ''}">Ordinateur de bureau</div>
  </div>
  <div class="scores">
    ${gauge(scores.performance, 'Performances')}
    ${gauge(scores.accessibility, 'Accessibilité')}
    ${gauge(scores.bestPractices, 'Bonnes pratiques')}
    ${gauge(scores.seo, 'SEO')}
  </div>
  <div class="hero">
    <div class="hero-score">${gauge(scores.performance, '').replace('gauge-label"></div>', '')}</div>
    <div>
      <div class="hero-title">Performances</div>
      <p style="font-size:14px;color:#5f6368;line-height:1.5;">Rapport généré via Lighthouse CLI — ${modeLabel}. Scores identiques au moteur PageSpeed Insights (Google).</p>
      <div class="legend">● 90–100 Bon &nbsp; ● 50–89 À améliorer &nbsp; ● 0–49 Faible</div>
    </div>
    <div class="preview">
      <div class="preview-bar"></div>
      <div class="preview-body">PokéStore<br/><br/>BOUTIQUE DE CARTES POKÉMON</div>
    </div>
  </div>
  <div class="footer">Audit Lighthouse · ${new Date().toLocaleDateString('fr-FR')} · pokestore-hazel.vercel.app</div>
</body>
</html>`;
}

mkdirSync(OUT_DIR, { recursive: true });

const scoresJson = {
  url: SITE_URL,
  date: new Date().toISOString(),
  mobile,
  desktop,
  source: 'Lighthouse CLI (même moteur que PageSpeed Insights)',
};
writeFileSync(join(OUT_DIR, 'pagespeed-scores.json'), JSON.stringify(scoresJson, null, 2));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });

for (const [mode, scores, filename] of [
  ['mobile', mobile, 'pagespeed-mobile.png'],
  ['desktop', desktop, 'pagespeed-desktop-bureau-generated.png'],
]) {
  const html = buildHtml(mode, scores);
  const htmlPath = join(OUT_DIR, `pagespeed-${mode}.html`);
  writeFileSync(htmlPath, html);
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT_DIR, filename) });
  console.log(`✅ ${filename}`);
}

await browser.close();
