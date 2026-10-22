import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/* C25.3: priceLabel e string literal; nenhuma conversao numerica pode tocar o preco. */
const FORBIDDEN = [/\bNumber\s*\(/, /\bparseFloat\s*\(/, /\bparseInt\s*\(/, /\.toFixed\s*\(/, /\bMath\.\w+\s*\(/, /\+\s*priceLabel/, /Intl\.NumberFormat/];

const FILES = ['NftCard.tsx', 'NftCardSkeleton.tsx'];

describe('nft-card nao converte o preco em numero', () => {
  it.each(FILES)('%s', (file) => {
    const src = readFileSync(resolve(import.meta.dirname, '../src/patterns/nft-card', file), 'utf8');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(FORBIDDEN.filter((re) => re.test(code)).map(String)).toEqual([]);
  });

  it('o detector enxerga uma conversao (guarda do proprio teste)', () => {
    const bad = 'const n = Number(priceLabel);';
    expect(FORBIDDEN.some((re) => re.test(bad))).toBe(true);
  });
});
