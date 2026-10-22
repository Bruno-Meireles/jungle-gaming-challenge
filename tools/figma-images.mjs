// Uso: node --env-file=.env tools/figma-images.mjs
// Baixa os image fills dos NFTs do Figma (docs/figma/file.json) e grava
// apps/web/public/nfts/<slug>.webp + manifest.json (Q13 do plano da home).
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const token = process.env.FIGMA_TOKEN;
const key = process.env.FIGMA_FILE_KEY || "OyXYOPplYqCs5qkbUCscuo";
const out = "apps/web/public/nfts";
if (!token) {
  console.error("FIGMA_TOKEN ausente. Defina-o em .env (veja .env.example).");
  process.exit(1);
}

// Cards do frame da home ("Grid Rows"): titulo do Figma -> no do retangulo com o image fill.
const cards = [
  ["Emerald Ape #042", "4:137"],
  ["Sage Nomad #009", "4:162"],
  ["Neon Vessel #552", "4:164"],
  ["Cosmic Bloom #118", "4:280"],
  ["Violet Nomad #314", "4:282"],
  ["Ivory Baron #088", "4:284"],
  ["Golden Beat #207", "4:286"],
  ["Golden Signal #160", "4:291"],
];
const slugify = (s) => s.toLowerCase().replace(/#/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const api = async (path) => {
  const res = await fetch(`https://api.figma.com${path}`, { headers: { "X-Figma-Token": token } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} em ${path}`);
  return res.json();
};

const file = await api(`/v1/files/${key}?ids=${cards.map((c) => c[1]).join(",")}`);
const refOf = new Map();
(function walk(n) {
  const fill = (n.fills ?? []).find((f) => f.type === "IMAGE");
  if (fill && cards.some((c) => c[1] === n.id)) refOf.set(n.id, fill.imageRef);
  (n.children ?? []).forEach(walk);
})(file.document);

const { meta } = await api(`/v1/files/${key}/images`);
const urls = meta.images;
const cache = new Map();
const fetchRef = async (ref) => {
  if (!cache.has(ref)) cache.set(ref, Buffer.from(await (await fetch(urls[ref])).arrayBuffer()));
  return cache.get(ref);
};

await mkdir(out, { recursive: true });
const manifest = [];
for (const [title, nodeId] of cards) {
  const ref = refOf.get(nodeId);
  if (!ref) throw new Error(`Sem image fill para ${nodeId}`);
  const slug = slugify(title);
  const { data, info } = await sharp(await fetchRef(ref)).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  await writeFile(`${out}/${slug}.webp`, data);
  manifest.push({ slug, title, width: info.width, height: info.height, sourceNodeId: nodeId });
  console.log(`${slug}.webp ${info.width}x${info.height} ${data.length}B (fill ${ref.slice(0, 6)})`);
}
await writeFile(`${out}/manifest.json`, JSON.stringify(manifest, null, 2) + "\n");
console.log(`${manifest.length} itens, ${cache.size} imagens distintas`);
