// Gera variantes redimensionadas das imagens do mock: <slug>-480.webp (cards, hero) e <slug>-960.webp (detalhe).
// Uso: node tools/resize-nft-images.mjs  (idempotente; ignora arquivos que ja sao variantes)
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.resolve('apps/web/public/nfts');
const SIZES = [480, 960];

const files = (await readdir(DIR)).filter((name) => name.endsWith('.webp') && !/-(480|960)\.webp$/.test(name));
for (const name of files) {
  const slug = name.replace(/\.webp$/, '');
  for (const size of SIZES) {
    await sharp(path.join(DIR, name))
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 78 })
      .toFile(path.join(DIR, `${slug}-${size}.webp`));
  }
}
console.log(`${files.length} imagens, ${SIZES.length} variantes cada`);
