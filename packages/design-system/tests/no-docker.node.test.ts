import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '../../..');

function readJson(rel: string): { scripts?: Record<string, string> } {
  return JSON.parse(readFileSync(resolve(ROOT, rel), 'utf8'));
}

const PACKAGES = ['package.json', 'packages/design-system/package.json', 'apps/web/package.json'];

describe('Docker proibido em desenvolvimento, testes e validacoes', () => {
  it.each(['test:visual', 'storybook:build', 'docker', '--update-snapshots'])(
    'scripts.verify da raiz nao contem %s',
    (forbidden) => {
      const verify = readJson('package.json').scripts?.verify ?? '';

      expect(verify).not.toContain(forbidden);
    },
  );

  it.each(PACKAGES)('nenhum script de %s contem docker', (rel) => {
    const offenders = Object.entries(readJson(rel).scripts ?? {}).filter(([, cmd]) =>
      /docker/i.test(cmd),
    );

    expect(offenders).toEqual([]);
  });

  it('nenhum arquivo tools/*.mjs contem docker', () => {
    const dir = resolve(ROOT, 'tools');
    const files = readdirSync(dir).filter((f) => f.endsWith('.mjs'));
    const offenders = files.filter((f) => /docker/i.test(readFileSync(resolve(dir, f), 'utf8')));

    expect(files.length).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });

  it('tools/visual.mjs existe e nao referencia visual-docker', () => {
    const file = resolve(ROOT, 'tools/visual.mjs');

    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file, 'utf8')).not.toContain('visual-docker');
  });
});
