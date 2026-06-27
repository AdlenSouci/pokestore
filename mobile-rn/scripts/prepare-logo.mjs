/**
 * Prépare logo.png : rogne les bords, coins arrondis, fond papier conservé.
 * Place ton fichier brut dans frontend/src/assets/logo-source.png puis :
 *   cd mobile-rn && npm run logo
 *
 * Si logo-source.png n'existe pas, logo.png actuel sert de source (sans l'écraser avant copie).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..');
const assets = path.join(root, 'frontend', 'src', 'assets');
const sourcePath = path.join(assets, 'logo-source.png');
const outputPath = path.join(assets, 'logo.png');
const mobilePath = path.join(root, 'mobile-rn', 'assets', 'logo.png');

const PAPER_BG = { r: 250, g: 246, b: 238, alpha: 255 };

async function prepareLogo(inputPath) {
  const trimmed = await sharp(inputPath)
    .flatten({ background: PAPER_BG })
    .trim({ threshold: 28 })
    .toBuffer();

  let meta = await sharp(trimmed).metadata();
  let w = meta.width ?? 600;
  let h = meta.height ?? 800;

  const inset = Math.round(Math.min(w, h) * 0.025);
  const cropped = await sharp(trimmed)
    .extract({
      left: inset,
      top: inset,
      width: Math.max(1, w - inset * 2),
      height: Math.max(1, h - inset * 2),
    })
    .toBuffer();

  meta = await sharp(cropped).metadata();
  w = meta.width ?? w;
  h = meta.height ?? h;
  const radius = Math.max(20, Math.round(Math.min(w, h) * 0.09));

  const mask = Buffer.from(
    `<svg width="${w}" height="${h}">
      <rect width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>`,
  );

  await sharp(cropped)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png({ compressionLevel: 6, effort: 7 })
    .toFile(outputPath);

  fs.copyFileSync(outputPath, mobilePath);

  const outMeta = await sharp(outputPath).metadata();
  console.log(
    'OK logo',
    `${outMeta.width}x${outMeta.height}`,
    `coins=${radius}px`,
  );
  console.log('→', path.relative(root, outputPath));
  console.log('→', path.relative(root, mobilePath));
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    if (!fs.existsSync(outputPath)) {
      throw new Error(
        'Ajoute frontend/src/assets/logo-source.png (ton logo brut) puis relance npm run logo',
      );
    }
    fs.copyFileSync(outputPath, sourcePath);
    console.log('logo-source.png créé depuis logo.png — remplace-le par ton original si besoin');
  }

  await prepareLogo(sourcePath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
