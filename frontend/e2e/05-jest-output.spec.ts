import { test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../docs/tests');

test('E2E-07 - Capture rendu sortie Jest (tests unitaires backend)', async ({ page }) => {
  const jestOutputPath = path.join(OUT, 'jest-output.txt');
  if (!fs.existsSync(jestOutputPath)) {
    test.skip(true, 'jest-output.txt manquant');
  }

  const raw = fs.readFileSync(jestOutputPath, 'utf-8');
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Tests unitaires backend (Jest)</title>
<style>
  body {
    margin: 0;
    padding: 32px;
    background: #1e1e2e;
    color: #cdd6f4;
    font-family: 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.5;
  }
  .header {
    background: #2d3561;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    border-left: 4px solid #7ec8a3;
  }
  .header h1 { margin: 0; font-size: 18px; }
  .header p { margin: 8px 0 0; opacity: 0.8; font-size: 13px; }
  pre {
    background: #181825;
    padding: 24px;
    border-radius: 8px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    border: 1px solid #313244;
    margin: 0;
  }
  .pass { color: #a6e3a1; font-weight: bold; }
  .fail { color: #f38ba8; font-weight: bold; }
  .info { color: #89b4fa; }
</style>
</head>
<body>
  <div class="header">
    <h1>Tests unitaires backend — npm run test</h1>
    <p>NestJS + Jest — PokeStore API</p>
  </div>
  <pre id="out"></pre>
  <script>
    const raw = ${JSON.stringify(escaped)};
    const colored = raw
      .replace(/(PASS .*)/g, '<span class="pass">$1</span>')
      .replace(/(FAIL .*)/g, '<span class="fail">$1</span>')
      .replace(/(Tests:.*)/g, '<span class="info">$1</span>')
      .replace(/(Test Suites:.*)/g, '<span class="info">$1</span>');
    document.getElementById('out').innerHTML = colored;
  </script>
</body>
</html>`;

  await page.setViewportSize({ width: 1100, height: 800 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({
    path: path.join(OUT, 'tests-unitaires-jest.png'),
    fullPage: true,
  });
});
