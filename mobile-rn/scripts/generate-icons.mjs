/**
 * Génère les icônes Expo à partir de assets/logo.png
 * Usage: node scripts/generate-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');
const logoPath = path.join(assetsDir, 'logo.png');

const BRAND_BG = '#2d3561';

async function writeFromLogo(filename, size, { padding = 48 } = {}) {
  if (!fs.existsSync(logoPath)) {
    throw new Error(`logo.png introuvable dans ${assetsDir}`);
  }
  const inner = size - padding * 2;
  const out = path.join(assetsDir, filename);
  await sharp(logoPath)
    .resize(inner, inner, { fit: 'contain', background: { r: 244, g: 239, b: 230, alpha: 255 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: BRAND_BG,
    })
    .png()
    .toFile(out);
  console.log('OK', filename, size);
}

async function main() {
  await writeFromLogo('icon.png', 1024, { padding: 64 });
  await writeFromLogo('adaptive-icon.png', 1024, { padding: 80 });
  await writeFromLogo('splash-icon.png', 512, { padding: 40 });
  await writeFromLogo('favicon.png', 192, { padding: 16 });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
