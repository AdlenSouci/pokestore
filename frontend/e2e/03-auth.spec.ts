import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../docs/tests');

test('E2E-04 - Modal de connexion accessible', async ({ page }) => {
  await page.goto('/');
  const loginBtn = page
    .getByRole('button', { name: /connexion|se connecter/i })
    .first();
  await loginBtn.click();
  await expect(page.getByText(/connexion/i).first()).toBeVisible();
  await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  await page.screenshot({
    path: path.join(OUT, 'e2e-04-login-modal.png'),
    fullPage: false,
  });
});

test('E2E-05 - Modal inscription accessible', async ({ page }) => {
  await page.goto('/');
  const signupBtn = page
    .getByRole('button', { name: /inscription|s'inscrire|sinscrire/i })
    .first();
  await signupBtn.click();
  await expect(page.getByPlaceholder(/nom/i).first()).toBeVisible();
  await page.screenshot({
    path: path.join(OUT, 'e2e-05-signup-modal.png'),
    fullPage: false,
  });
});
