// Run with Node 22+ after changing this specific asset. Never alters the image.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { measureNoteSurface } from "../src/components/sections/music-note-coverage.ts";

const asset = "/images/music/vintage-note-d2ae83.webp";
const bytes = await readFile(new URL(`../public${asset}`, import.meta.url));
const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const profile = measureNoteSurface(data, info.width, info.height);
const runs = [];
for (const width of profile.halfWidths) {
  const last = runs.at(-1);
  if (last && last[1] === width) last[0]++;
  else runs.push([1, width]);
}
const metadata = { asset, sha256: createHash("sha256").update(bytes).digest("hex"), width: info.width, height: info.height, runs };
await writeFile(new URL("../src/components/sections/music-note-surface.json", import.meta.url), `${JSON.stringify(metadata)}\n`);
