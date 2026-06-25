/** Screenshot du rapport Lighthouse HTML (section scores en haut). */
import { chromium } from '@playwright/test';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../../docs/cahier-des-charges/images');
const reportPath = join(OUT_DIR, 'lighthouse-mobile-report.html').replace(/\\/g, '/');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(`file:///${reportPath}`);
await page.waitForTimeout(2000);

// Capture la zone scores Lighthouse (header du rapport)
const header = page.locator('.lh-header, .lh-scores-wrapper, .lh-scores-header').first();
if (await header.count()) {
  await header.screenshot({ path: join(OUT_DIR, 'pagespeed-mobile.png') });
} else {
  await page.locator('.lh-container').first().screenshot({ path: join(OUT_DIR, 'pagespeed-mobile.png') });
}

console.log('✅ pagespeed-mobile.png');
await browser.close();
