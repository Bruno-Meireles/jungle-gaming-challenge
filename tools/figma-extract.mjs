// Uso: node --env-file=.env tools/figma-extract.mjs
// Baixa o JSON do arquivo e PNGs dos frames de topo para docs/figma/.
import { mkdir, writeFile } from "node:fs/promises";

const token = process.env.FIGMA_TOKEN;
const key = process.env.FIGMA_FILE_KEY || "OyXYOPplYqCs5qkbUCscuo";
const out = process.env.FIGMA_OUT_DIR || "docs/figma";
if (!token) {
  console.error("FIGMA_TOKEN ausente. Defina-o em .env (veja .env.example).");
  process.exit(1);
}

const api = async (path) => {
  const res = await fetch(`https://api.figma.com${path}`, {
    headers: { "X-Figma-Token": token },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} em ${path}: ${await res.text()}`);
  return res;
};

await mkdir(`${out}/screens`, { recursive: true });

const file = await (await api(`/v1/files/${key}?geometry=paths`)).json();
await writeFile(`${out}/file.json`, JSON.stringify(file, null, 2));
console.log(`file.json salvo (${file.name})`);

// Frames de topo de cada página
const frames = file.document.children.flatMap((page) =>
  (page.children ?? [])
    .filter((n) => n.type === "FRAME")
    .map((n) => ({ page: page.name, id: n.id, name: n.name, box: n.absoluteBoundingBox })),
);
await writeFile(`${out}/frames.json`, JSON.stringify(frames, null, 2));
console.log(`${frames.length} frames listados em frames.json`);

// Exporta em lotes para respeitar limites de URL
for (let i = 0; i < frames.length; i += 20) {
  const batch = frames.slice(i, i + 20);
  const ids = batch.map((f) => f.id).join(",");
  const { images } = await (await api(`/v1/images/${key}?ids=${encodeURIComponent(ids)}&format=png&scale=2`)).json();
  for (const f of batch) {
    const url = images[f.id];
    if (!url) continue;
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const safe = `${f.id.replace(":", "-")}_${f.name.replace(/[^\w.-]+/g, "_")}`;
    await writeFile(`${out}/screens/${safe}.png`, buf);
  }
}
console.log(`PNGs salvos em ${out}/screens/`);
