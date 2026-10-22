import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const INDEX = readFileSync(resolve(import.meta.dirname, '../src/index.ts'), 'utf8');

// Nomes de valor exportados (componentes) e nomes de tipo exportados em src/index.ts.
function exportedNames(source: string): { values: string[]; types: string[] } {
  const values: string[] = [];
  const types: string[] = [];
  for (const block of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const raw of block[1]!.split(',')) {
      const item = raw.trim();
      if (!item) continue;
      if (item.startsWith('type ')) types.push(item.slice(5).trim());
      else values.push(item);
    }
  }
  return { values, types };
}

describe('API publica do design system (src/index.ts)', () => {
  const { values, types } = exportedNames(INDEX);

  it('exporta componentes', () => {
    expect(values.length).toBeGreaterThan(20);
  });

  it.each(values)('%s exporta tambem o tipo de props (<Nome>Props)', (name) => {
    expect(types, `falta export type ${name}Props`).toContain(`${name}Props`);
  });
});
