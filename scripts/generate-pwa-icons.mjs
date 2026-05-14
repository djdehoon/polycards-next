/**
 * Generates simple Ukrainian-flag PWA icons (blue / yellow) into public/icons/.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");

const BLUE = "#0057B7";
const YELLOW = "#FFD700";

async function bilayerFlag(width, height) {
  const mid = Math.floor(height / 2);
  const lowerH = height - mid;
  const lower = await sharp({
    create: { width, height: lowerH, channels: 3, background: YELLOW },
  })
    .png()
    .toBuffer();

  return sharp({
    create: { width, height: mid, channels: 3, background: BLUE },
  }).composite([{ input: lower, top: mid, left: 0 }]);
}

async function maskableFlag(outer, inner) {
  const pad = Math.floor((outer - inner) / 2);
  const flagBuf = await (await bilayerFlag(inner, inner)).png().toBuffer();
  return sharp({
    create: { width: outer, height: outer, channels: 3, background: "#0f0f0f" },
  }).composite([{ input: flagBuf, left: pad, top: pad }]);
}

fs.mkdirSync(outDir, { recursive: true });

const pairs = [
  ["icon-192.png", () => bilayerFlag(192, 192)],
  ["icon-512.png", () => bilayerFlag(512, 512)],
  ["icon-192-maskable.png", () => maskableFlag(192, 128)],
  ["icon-512-maskable.png", () => maskableFlag(512, 360)],
  ["apple-touch-icon-180.png", () => bilayerFlag(180, 180)],
];

for (const [name, fn] of pairs) {
  const buf = await (await fn()).png().toBuffer();
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log("wrote", name);
}

const fav32 = await (await bilayerFlag(32, 32)).png().toBuffer();
fs.writeFileSync(path.join(outDir, "favicon-32.png"), fav32);
console.log("wrote favicon-32.png");
