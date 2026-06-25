import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../docs/tests');

test('E2E-02 - Navigation vers la boutique', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');
  await page.getByRole('button', { name: /voir la boutique/i }).click();
  await expect(page.getByRole('heading', { name: /boutique/i })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText(/chargement/i)).toBeHidden({ timeout: 120_000 });
  await page.screenshot({
    path: path.join(OUT, 'e2e-02-shop.png'),
    fullPage: false,
  });
});

test('E2E-03 - Filtres boutique disponibles', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await page.getByRole('button', { name: /voir la boutique/i }).click();
  await expect(page.getByRole('heading', { name: /boutique/i })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole('spinbutton', { name: /prix min/i })).toBeVisible();
  await expect(page.getByRole('combobox', { name: /série|serie/i })).toBeVisible();
  await page.screenshot({
    path: path.join(OUT, 'e2e-03-filters.png'),
    fullPage: false,
  });
});
