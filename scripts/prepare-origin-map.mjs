// Rebuild the small, local-only line-art dataset. No map service runs in the browser.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const worldURL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
const regionURL = "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/IDN/ADM1/geoBoundaries-IDN-ADM1_simplified.geojson";
async function source(url, localName) {
  // Optional cached source directory is useful for reproducible/offline rebuilds.
  if (process.argv[2]) return JSON.parse(await readFile(join(process.argv[2], localName), "utf8"));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Map download failed: ${response.status}`);
  return response.json();
}
function simplify(points, tolerance) {
  const kept = new Set([0, points.length - 1]), stack = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop(), a = points[start], b = points[end];
    const dx = b[0] - a[0], dy = b[1] - a[1], length = dx * dx + dy * dy;
    let furthest = -1, max = tolerance * tolerance;
    for (let i = start + 1; i < end; i++) {
      const p = points[i], t = length ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) : 0;
      const distance = (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2;
      if (distance > max) { max = distance; furthest = i; }
    }
    if (furthest >= 0) { kept.add(furthest); stack.push([start, furthest], [furthest, end]); }
  }
  return [...kept].sort((a, b) => a - b).map(index => points[index].map(n => +n.toFixed(4)));
}
function lines(feature, tolerance) {
  const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  return polygons.flatMap(polygon => polygon.map(ring => simplify(ring, tolerance)).filter(ring => ring.length >= 4));
}
const [world, region] = await Promise.all([source(worldURL, "world.geojson"), source(regionURL, "indonesia-adm1.geojson")]);
const target = region.features.find(feature => feature.properties.shapeISO === "ID-KB");
if (!target) throw new Error("West Kalimantan boundary missing");
const data = {
  attribution: "Natural Earth (public domain); © OpenStreetMap contributors / geoBoundaries (ODbL 1.0). Derived line database: ODbL 1.0.",
  sources: [worldURL, regionURL], license: "https://opendatacommons.org/licenses/odbl/1-0/",
  world: world.features.flatMap(feature => lines(feature, .045)),
  region: region.features.flatMap(feature => lines(feature, .012)),
  target: lines(target, .004),
};
const directory = join(process.cwd(), "public/maps");
await mkdir(directory, { recursive: true });
await writeFile(join(directory, "origin-boundaries.json"), JSON.stringify(data));
// Accessible, local SVG fallback for no JS, unavailable canvas, or a failed fetch.
const project = ([lon, lat]) => [400 + (lon - 111) * 65, 300 - (lat - .3) * 65];
const path = data.target.map(line => line.map((p, i) => `${i ? "L" : "M"}${project(p).map(n => n.toFixed(2)).join(",")}`).join(" ")).join(" ");
const [x, y] = project([109.3425, -.0263]);
await writeFile(join(directory, "pontianak.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><path d="${path}" fill="none" stroke="#a5a29c" stroke-width="1"/><circle cx="${x}" cy="${y}" r="12" fill="none" stroke="#d9b482"/><circle cx="${x}" cy="${y}" r="3" fill="#d9b482"/><text x="${x + 22}" y="${y + 6}" font-family="Arial,sans-serif" font-size="17" fill="#f2f0eb">Pontianak</text></svg>`);
console.log(`Prepared ${data.world.length} world lines, ${data.region.length} regional lines, ${data.target.length} West Kalimantan lines.`);
