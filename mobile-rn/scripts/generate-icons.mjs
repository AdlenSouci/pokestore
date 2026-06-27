/**
 * Génère les icônes PokéStore (Pokéball) pour Expo.
 * Usage: node scripts/generate-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');

const BRAND_BG = '#2d3561';

function pokeballSvg({ bg = 'none', padding = 8 } = {}) {
  const bgRect =
    bg === 'none'
      ? ''
      : `<rect width="100" height="100" fill="${bg}" rx="0"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  ${bgRect}
  <g transform="translate(${padding / 2} ${padding / 2}) scale(${(100 - padding) / 100})">
    <circle cx="50" cy="50" r="46" fill="#fff" stroke="#1a1a2e" stroke-width="5"/>
    <path d="M4 50 A46 46 0 0 1 96 50 Z" fill="#ef4444" stroke="#1a1a2e" stroke-width="5"/>
    <rect x="4" y="46" width="92" height="8" fill="#1a1a2e"/>
    <circle cx="50" cy="50" r="14" fill="#fff" stroke="#1a1a2e" stroke-width="5"/>
    <circle cx="50" cy="50" r="6" fill="#fff" stroke="#1a1a2e" stroke-width="3"/>
  </g>
</svg>`;
}

async function writePng(filename, size, svg) {
  const out = path.join(assetsDir, filename);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log('OK', filename, size);
}

async function main() {
  await writePng('icon.png', 1024, pokeballSvg({ bg: BRAND_BG, padding: 14 }));
  await writePng('adaptive-icon.png', 1024, pokeballSvg({ bg: 'none', padding: 10 }));
  await writePng('splash-icon.png', 512, pokeballSvg({ bg: 'none', padding: 6 }));
  await writePng('favicon.png', 192, pokeballSvg({ bg: BRAND_BG, padding: 12 }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
