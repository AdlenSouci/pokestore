import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../docs/tests');

test.use({ baseURL: 'https://pokestore-api-btz1.onrender.com' });

test('E2E-06 - Swagger API docs accessibles', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/api/docs', { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(page.locator('.swagger-ui').first()).toBeVisible({ timeout: 120_000 });
  await expect(page.locator('h2.title, .info .title').first()).toBeVisible({
    timeout: 30_000,
  });
  await page.screenshot({
    path: path.join(OUT, 'e2e-06-swagger.png'),
    fullPage: true,
  });
});
