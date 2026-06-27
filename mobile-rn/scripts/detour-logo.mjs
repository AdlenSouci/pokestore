/**
 * Détoure logo.png — flood-fill inverse (fond atteignable depuis les bords)
 * Usage: node scripts/detour-logo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..');

const TARGETS = [
  path.join(root, 'frontend', 'src', 'assets', 'logo.png'),
  path.join(root, 'mobile-rn', 'assets', 'logo.png'),
];

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function sat(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/** Pixels du dessin à conserver (encre, couleurs) */
function isForeground(r, g, b) {
  const l = lum(r, g, b);
  const s = sat(r, g, b);

  if (s >= 0.14) return true;
  if (l <= 72 && s <= 0.35) return true;
  if (l <= 95 && s >= 0.06) return true;
  return false;
}

/** Tout le reste (papier, scan noir, gris) = fond supprimable */
function isBackground(r, g, b) {
  return !isForeground(r, g, b);
}

function floodFillFromEdges(data, width, height, channels, test) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total * 2);
  let head = 0;
  let tail = 0;

  const tryPush = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * channels;

    if (data[i + 3] === 0) {
      visited[idx] = 1;
      queue[tail++] = x;
      queue[tail++] = y;
      return;
    }

    if (!test(data[i], data[i + 1], data[i + 2])) return;
    visited[idx] = 1;
    queue[tail++] = x;
    queue[tail++] = y;
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (head < tail) {
    const x = queue[head++];
    const y = queue[head++];
    if (x > 0) tryPush(x - 1, y);
    if (x < width - 1) tryPush(x + 1, y);
    if (y > 0) tryPush(x, y - 1);
    if (y < height - 1) tryPush(x, y + 1);
  }

  for (let idx = 0; idx < total; idx++) {
    if (!visited[idx]) continue;
    const i = idx * channels;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 0;
  }
}

function softenEdges(data, width, height, channels) {
  const copy = Buffer.from(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const i = idx * channels;
      if (copy[i + 3] === 0) continue;

      let transparentNeighbors = 0;
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const ni = (y + dy) * width + (x + dx);
        if (copy[ni * channels + 3] === 0) transparentNeighbors++;
      }
      if (transparentNeighbors >= 2 && isBackground(data[i], data[i + 1], data[i + 2])) {
        data[i + 3] = Math.min(data[i + 3], 100);
      }
    }
  }
}

async function detourLogo(inputPath) {
  if (!fs.existsSync(inputPath)) {
    console.warn('SKIP', inputPath);
    return;
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.from(data);

  floodFillFromEdges(out, width, height, channels, isBackground);
  softenEdges(out, width, height, channels);

  const tmp = `${inputPath}.tmp.png`;
  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(tmp);

  await sharp(tmp)
    .trim({ threshold: 5 })
    .png({ compressionLevel: 9 })
    .toFile(inputPath);

  fs.unlinkSync(tmp);

  const meta = await sharp(inputPath).metadata();
  console.log('OK', path.relative(root, inputPath), `${meta.width}x${meta.height}`);
}

async function main() {
  const source = TARGETS[0];
  if (!fs.existsSync(source)) {
    throw new Error(`logo introuvable: ${source}`);
  }

  await detourLogo(source);

  for (let i = 1; i < TARGETS.length; i++) {
    fs.copyFileSync(source, TARGETS[i]);
    console.log('COPY', path.relative(root, TARGETS[i]));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
