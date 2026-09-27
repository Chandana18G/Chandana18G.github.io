// Generates the social preview image and raster icons into /public.
// Run with `npm run images` after changing public/favicon.svg or the text below.
// The outputs are committed, so this is not part of the normal build.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const OUT = new URL('../public/', import.meta.url);
const path = (name) => fileURLToPath(new URL(name, OUT));

// ---- Open Graph image (1200x630) -------------------------------------------
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A flat echo of the hero graph on the right-hand side.
const rand = mulberry32(18);
const nodes = Array.from({ length: 70 }, () => {
  const r = 250 * Math.pow(rand(), 0.6);
  const a = rand() * Math.PI * 2;
  return { x: 900 + Math.cos(a) * r * 1.2, y: 315 + Math.sin(a) * r * 0.75, s: 2 + rand() * 4 };
});
const edges = [];
nodes.forEach((n, i) => {
  nodes
    .map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 }))
    .filter((o) => o.j !== i)
    .sort((a, b) => a.d - b.d)
    .slice(0, 2)
    .forEach(({ j }) => edges.push([i, j]));
});

const font = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const mono = "Consolas, 'Courier New', monospace";
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="75%" cy="45%" r="55%">
      <stop offset="0" stop-color="#8b5cf6" stop-opacity=".35"/>
      <stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="name" x1="0" x2="1">
      <stop offset="0" stop-color="#b794ff"/>
      <stop offset=".6" stop-color="#c77dff"/>
      <stop offset="1" stop-color="#e879f9"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#07060b"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g stroke="#b794ff" stroke-opacity=".3" stroke-width="1.2">
    ${edges.map(([a, b]) => `<line x1="${nodes[a].x.toFixed(1)}" y1="${nodes[a].y.toFixed(1)}" x2="${nodes[b].x.toFixed(1)}" y2="${nodes[b].y.toFixed(1)}"/>`).join('')}
  </g>
  <g fill="#c77dff">
    ${nodes.map((n) => `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.s.toFixed(1)}"/>`).join('')}
  </g>
  <text x="80" y="200" font-family="${mono}" font-size="28" fill="#c77dff">chandana18g.github.io</text>
  <text x="80" y="300" font-family="${font}" font-size="84" font-weight="700" fill="#ece8f5">Chandana<tspan fill="url(#name)">.</tspan></text>
  <text x="80" y="370" font-family="${font}" font-size="36" fill="#a59dbb">Applied Data Science &amp; AI</text>
  <text x="80" y="420" font-family="${font}" font-size="30" fill="#a59dbb">Forecasting · RAG / GenAI · BI</text>
  <rect x="80" y="480" width="560" height="56" rx="28" fill="#8b5cf6" fill-opacity=".18" stroke="#8b5cf6"/>
  <text x="108" y="516" font-family="${mono}" font-size="24" fill="#ece8f5">working student · Regensburg / remote</text>
</svg>`;

await sharp(Buffer.from(og)).png().toFile(path('og-image.png'));

// ---- Raster icons from favicon.svg ------------------------------------------
const svg = await readFile(new URL('favicon.svg', OUT));

await sharp(svg, { density: 512 }).resize(180, 180).png().toFile(path('apple-touch-icon.png'));

// favicon.ico containing a single 32x32 PNG (supported by all modern browsers).
const png32 = await sharp(svg, { density: 256 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png32.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
await writeFile(path('favicon.ico'), Buffer.concat([header, png32]));

console.log('Generated og-image.png, apple-touch-icon.png, favicon.ico');
