import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findLocaleApis } from './helpers/locale-apis';

/* Plano design-system-i18n, G2.b (F4): o DS nao usa API dependente de locale; formatacao fica no app. */

describe('guarda de APIs de locale: autotestes do detector', () => {
  it.each([
    ['Intl.NumberFormat', "const f = new Intl.NumberFormat('pt-BR');"],
    ['toLocaleString', 'const s = n.toLocaleString();'],
    ['toLocaleDateString', 'const s = d.toLocaleDateString();'],
    ['localeCompare', 'const o = a.localeCompare(b);'],
    ['navigator.language', 'const l = navigator.language;'],
    ['document.documentElement.lang', 'const l = document.documentElement.lang;'],
  ])('reprova %s', (_name, src) => {
    expect(findLocaleApis(src)).toHaveLength(1);
  });

  it('aceita Intl apenas em comentario', () => {
    expect(findLocaleApis('// usa Intl.NumberFormat no app\n/* toLocaleString */\nconst a = 1;')).toEqual([]);
  });

  it('aceita propriedade de objeto lang', () => {
    expect(findLocaleApis('const o = { lang: x };')).toEqual([]);
  });

  it('aceita String(n)', () => {
    expect(findLocaleApis('const s = String(n);')).toEqual([]);
  });
});

const SRC = resolve(import.meta.dirname, '../src');

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const FILES = walk(SRC)
  .map((p) => relative(SRC, p).split('\\').join('/'))
  .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.(test|stories)\./.test(f) && !f.startsWith('test/'))
  .sort();

describe('src do design system nao usa APIs dependentes de locale', () => {
  it.each(FILES)('%s', (file) => {
    const src = readFileSync(join(SRC, file), 'utf8');
    expect(findLocaleApis(src)).toEqual([]);
  });
});
