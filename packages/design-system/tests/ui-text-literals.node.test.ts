import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findUiTextLiterals } from './helpers/ui-text-literals';

/* Plano design-system-i18n, G1: o DS nao embute texto de interface; todo rotulo entra por prop (ADR-14). */

const texts = (src: string, file = 'x.tsx') => findUiTextLiterals(src, file).map((v) => v.text);

describe('guarda de texto literal: autotestes do detector', () => {
  it('G1.a reprova texto JSX com letra', () => {
    expect(texts('const A = () => <p>Olá</p>;')).toEqual(['Olá']);
  });

  it('G1.b reprova aria-label literal', () => {
    expect(texts('const A = () => <button aria-label="Fechar" />;')).toHaveLength(1);
  });

  it('G1.c reprova aria-label com expressao de string literal', () => {
    expect(texts("const A = () => <button aria-label={'Next'} />;")).toHaveLength(1);
  });

  it('G1.d reprova default de parametro de rotulo', () => {
    const src = "export function C({ closeLabel = 'Fechar' }: { closeLabel?: string }) { return closeLabel; }";
    expect(texts(src, 'x.ts')).toHaveLength(1);
  });

  it('G1.e reprova propriedade label com literal', () => {
    expect(texts("const TONES = { error: { label: 'Erro' } };", 'x.ts')).toHaveLength(1);
  });

  it('G1.f aceita classes em cva()/cn()', () => {
    expect(texts("const v = cva('base', { variants: { label: 'h-32 px-8' } });", 'x.ts')).toEqual([]);
    expect(texts("const c = cn('x', { label: 'h-32' });", 'x.ts')).toEqual([]);
  });

  it('G1.g aceita glifo sem letra com aria-hidden="true"', () => {
    expect(texts('const A = () => <span aria-hidden="true">/</span>;')).toEqual([]);
    expect(texts('const A = () => <span aria-hidden="true">*</span>;')).toEqual([]);
  });

  it('G1.h reprova glifo sem letra sem aria-hidden', () => {
    expect(texts('const A = () => <span>/</span>;')).toEqual(['/']);
  });

  it('ignora comentarios, valores em expressao e atributos nao textuais', () => {
    const src = [
      '// aria-label="Fechar"',
      '/* <p>Olá</p> */',
      'const A = ({ n }: { n: number }) => <a href="/home" className="px-8" aria-current="page">{n}</a>;',
    ].join('\n');
    expect(texts(src)).toEqual([]);
  });

  it('informa a linha da ocorrencia', () => {
    const [v] = findUiTextLiterals('const a = 1;\nconst B = () => <p>Olá</p>;', 'x.tsx');
    expect(v?.line).toBe(2);
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

describe('src do design system nao tem texto de interface literal', () => {
  it.each(FILES)('%s', (file) => {
    const src = readFileSync(join(SRC, file), 'utf8');
    const violations = findUiTextLiterals(src, file).map((v) => `${v.file}:${v.line}:${v.text}`);
    expect(violations).toEqual([]);
  });
});
