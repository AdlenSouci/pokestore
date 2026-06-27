/**
 * Coins arrondis sur logo.png — conserve le fond (papier blanc/crème), pas de détourage.
 * Usage: node scripts/round-logo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..');

const PAPER_BG = { r: 244, g: 239, b: 230, alpha: 255 };

const TARGETS = [
  path.join(root, 'frontend', 'src', 'assets', 'logo.png'),
  path.join(root, 'mobile-rn', 'assets', 'logo.png'),
];

async function roundLogo(inputPath, radiusRatio = 0.06) {
  if (!fs.existsSync(inputPath)) {
    console.warn('SKIP', inputPath);
    return;
  }

  const meta = await sharp(inputPath).metadata();
  const w = meta.width ?? 700;
  const h = meta.height ?? 950;
  const radius = Math.round(Math.min(w, h) * radiusRatio);

  const flattened = await sharp(inputPath)
    .flatten({ background: PAPER_BG })
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="${w}" height="${h}">
      <rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>`,
  );

  const tmp = `${inputPath}.tmp.png`;
  await sharp(flattened)
    .resize(w, h, { fit: 'fill' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(tmp);

  await sharp(tmp).png({ compressionLevel: 9 }).toFile(inputPath);
  fs.unlinkSync(tmp);

  console.log('OK', path.relative(root, inputPath), `${w}x${h}`, `r=${radius}`);
}

async function main() {
  const source = TARGETS[0];
  if (!fs.existsSync(source)) {
    throw new Error(`logo introuvable: ${source}`);
  }

  await roundLogo(source);

  for (let i = 1; i < TARGETS.length; i++) {
    fs.copyFileSync(source, TARGETS[i]);
    console.log('COPY', path.relative(root, TARGETS[i]));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
