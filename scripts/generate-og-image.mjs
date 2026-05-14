/**
 * Renders public/og-image.png (1200×630) for Open Graph / Twitter cards.
 * Run: node scripts/generate-og-image.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "public", "og-image.png");

const W = 1200;
const H = 630;
const mid = Math.floor(H / 2);

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${mid}" fill="#0057B8"/>
  <rect y="${mid}" width="${W}" height="${H - mid}" fill="#FFD700"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)" opacity="0.25"/>
  <defs>
    <linearGradient id="vignette" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.5"/>
      <stop offset="45%" stop-color="#0f172a" stop-opacity="0"/>
      <stop offset="55%" stop-color="#0f172a" stop-opacity="0"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <text x="60" y="220" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
        font-size="76" font-weight="700" fill="#f8fafc">PolyCards</text>
  <text x="60" y="300" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
        font-size="36" font-weight="600" fill="#e2e8f0">Learn languages that stick</text>
  <text x="60" y="380" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
        font-size="28" font-weight="500" fill="#cbd5e1">5 min/day · Science-backed · Real retention</text>
  <text x="60" y="520" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
        font-size="24" font-weight="500" fill="#1e293b">Spaced repetition for real life</text>
</svg>`;

const buf = await sharp(Buffer.from(svg)).png().toBuffer();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buf);
console.log("wrote", out);
