/**
 * Generates Ukrainian-flag PWA icons (blue #0057B8 / yellow #FFD700) into public/icons/.
 * Maskable variants use a transparent outer ring; flag sits in the center ~66% safe zone.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");

const BLUE = "#0057B8";
const YELLOW = "#FFD700";

async function bilayerFlag(width, height) {
  const mid = Math.floor(height / 2);
  const blueStrip = await sharp({
    create: { width, height: mid, channels: 3, background: BLUE },
  })
    .png()
    .toBuffer();

  return sharp({
    create: { width, height, channels: 3, background: YELLOW },
  }).composite([{ input: blueStrip, top: 0, left: 0 }]);
}

/** Maskable: transparent padding; flag in center safe zone (66% of outer edge). */
async function maskableFlag(outer) {
  const inner = Math.round(outer * 0.66);
  const pad = Math.floor((outer - inner) / 2);
  const flagBuf = await (await bilayerFlag(inner, inner)).png().toBuffer();
  return sharp({
    create: {
      width: outer,
      height: outer,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([{ input: flagBuf, left: pad, top: pad }]);
}

/** iOS: opaque flag on white canvas (no transparency in deliverable). */
async function appleTouch180() {
  const flagBuf = await (await bilayerFlag(180, 180)).png().toBuffer();
  return sharp({
    create: { width: 180, height: 180, channels: 3, background: "#ffffff" },
  }).composite([{ input: flagBuf, left: 0, top: 0 }]);
}

fs.mkdirSync(outDir, { recursive: true });

const pairs = [
  ["icon-192.png", () => bilayerFlag(192, 192)],
  ["icon-512.png", () => bilayerFlag(512, 512)],
  ["icon-192-maskable.png", () => maskableFlag(192)],
  ["icon-512-maskable.png", () => maskableFlag(512)],
  ["apple-touch-icon-180.png", () => appleTouch180()],
];

for (const [name, fn] of pairs) {
  const buf = await (await fn()).png().toBuffer();
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log("wrote", name);
}

const fav32 = await (await bilayerFlag(32, 32)).png().toBuffer();
fs.writeFileSync(path.join(outDir, "favicon-32.png"), fav32);
console.log("wrote favicon-32.png");

const icoBuf = await toIco([fav32]);
fs.writeFileSync(path.join(outDir, "favicon.ico"), icoBuf);
console.log("wrote favicon.ico");
