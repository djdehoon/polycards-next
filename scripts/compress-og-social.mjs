/**
 * Builds public/og-image-social.jpg from public/og-image.png for WhatsApp/Facebook (~1200x630, compressed).
 * Run: node scripts/compress-og-social.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public", "og-image.png");
const out = path.join(root, "public", "og-image-social.jpg");

if (!fs.existsSync(src)) {
  console.error("Missing", src);
  process.exit(1);
}

const buf = await sharp(src)
  .resize(1200, 630, { fit: "cover" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toBuffer();

fs.writeFileSync(out, buf);
console.log("wrote", out, `(${(buf.length / 1024).toFixed(0)} KB)`);
