import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../docs/tests');

test('E2E-01 - Accueil charge et affiche le titre', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText(/PokéCard|PokeCard/i);
  await expect(page.getByRole('button', { name: /voir la boutique/i })).toBeVisible();
  await page.screenshot({
    path: path.join(OUT, 'e2e-01-home.png'),
    fullPage: false,
  });
});
