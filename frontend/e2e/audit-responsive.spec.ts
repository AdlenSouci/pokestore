import { test } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../docs/audit-css');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: 'mobile-375', width: 375, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1366', width: 1366, height: 900 },
];

const pages: Array<{ slug: string; setup?: (page: import('@playwright/test').Page) => Promise<void> }> = [
  { slug: 'home' },
  {
    slug: 'shop',
    setup: async (page) => {
      await page.getByRole('button', { name: /voir la boutique/i }).click();
      await page.getByRole('heading', { level: 1, name: /boutique/i }).waitFor({ timeout: 30_000 });
      await page.waitForTimeout(2500);
    },
  },
  {
    slug: 'login',
    setup: async (page) => {
      const menuBtn = page.getByRole('button', { name: /ouvrir le menu/i });
      if (await menuBtn.isVisible()) await menuBtn.click();
      await page.getByRole('button', { name: /^connexion$/i }).first().click();
      await page.waitForTimeout(800);
    },
  },
  {
    slug: 'signup',
    setup: async (page) => {
      const menuBtn = page.getByRole('button', { name: /ouvrir le menu/i });
      if (await menuBtn.isVisible()) await menuBtn.click();
      await page.getByRole('button', { name: /^inscription$/i }).first().click();
      await page.waitForTimeout(800);
    },
  },
];

for (const v of viewports) {
  for (const p of pages) {
    test(`AUDIT ${v.name} - ${p.slug}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto('/');
      if (p.setup) await p.setup(page);
      await page.screenshot({
        path: path.join(OUT, `${v.name}__${p.slug}.png`),
        fullPage: true,
      });
    });
  }
}
