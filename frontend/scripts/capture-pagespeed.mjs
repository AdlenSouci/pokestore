/**
 * Capture PageSpeed Insights (mobile + desktop) for the livrable oral.
 * Usage: node scripts/capture-pagespeed.mjs
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../../docs/cahier-des-charges/images');
const SITE_URL = 'https://pokestore-hazel.vercel.app';
const PSI_URL = 'https://pagespeed.web.dev/';

mkdirSync(OUT_DIR, { recursive: true });

async function captureStrategy(page, strategy) {
  const filename =
    strategy === 'mobile' ? 'pagespeed-mobile.png' : 'pagespeed-desktop-bureau.png';

  console.log(`\n📊 PageSpeed — mode ${strategy}…`);

  await page.goto(PSI_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  const input = page.locator('input[type="url"], input[placeholder*="URL"], input[aria-label*="URL"]').first();
  await input.waitFor({ state: 'visible', timeout: 30000 });
  await input.fill(SITE_URL);

  const analyzeBtn = page.getByRole('button', { name: /analyser|analyze/i }).first();
  await analyzeBtn.click();

  // Attendre les scores (analyse Google ~30–90 s)
  await page.waitForFunction(
    () => {
      const text = document.body.innerText;
      return (
        text.includes('Performances') &&
        (text.includes('/100') || text.match(/\b9[0-9]\b|\b100\b/))
      );
    },
    { timeout: 180000 },
  );

  // Basculer mobile / desktop si nécessaire
  if (strategy === 'mobile') {
    const mobileTab = page.getByRole('tab', { name: /mobile/i }).first();
    if (await mobileTab.isVisible().catch(() => false)) {
      await mobileTab.click();
      await page.waitForTimeout(2000);
    }
  } else {
    const desktopTab = page.getByRole('tab', { name: /ordinateur|desktop|bureau/i }).first();
    if (await desktopTab.isVisible().catch(() => false)) {
      await desktopTab.click();
      await page.waitForTimeout(2000);
    }
  }

  const outPath = join(OUT_DIR, filename);
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`✅ Sauvegardé : ${outPath}`);
}

async function fetchScores(strategy) {
  const apiUrl = new URL('https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed');
  apiUrl.searchParams.set('url', SITE_URL);
  apiUrl.searchParams.set('strategy', strategy);
  for (const cat of ['performance', 'accessibility', 'best-practices', 'seo']) {
    apiUrl.searchParams.append('category', cat);
  }

  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`PSI API ${strategy}: ${res.status}`);
  const data = await res.json();
  const cats = data.lighthouseResult?.categories ?? {};
  return {
    performance: Math.round((cats.performance?.score ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

try {
  await captureStrategy(page, 'mobile');
  // Desktop déjà fourni par l'utilisateur — on ne réécrase pas sauf si absent
} finally {
  await browser.close();
}

console.log('\n📡 Récupération scores API…');
const [mobileScores, desktopScores] = await Promise.all([
  fetchScores('mobile'),
  fetchScores('desktop'),
]);

console.log('Mobile:', mobileScores);
console.log('Desktop:', desktopScores);

// Écrire scores JSON pour mise à jour doc
import { writeFileSync } from 'fs';
writeFileSync(
  join(OUT_DIR, 'pagespeed-scores.json'),
  JSON.stringify({ mobile: mobileScores, desktop: desktopScores, url: SITE_URL, date: new Date().toISOString() }, null, 2),
);
