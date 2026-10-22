import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const FONTS_CSS = resolve(import.meta.dirname, '../src/styles/fonts.css');
const TOKENS_CSS = resolve(import.meta.dirname, '../src/styles/tokens.css');
const OFL = resolve(import.meta.dirname, '../src/fonts/OFL.txt');

// Tolerante: arquivos ainda podem nao existir (RED deve falhar por asserção, não por ENOENT).
function read(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

type FontFace = { family: string; weight: string; style: string; display: string; src: string };

function parseFontFaces(css: string): FontFace[] {
  const blocks = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]!);
  const prop = (block: string, name: string) =>
    new RegExp(`(?:^|[;\\s])${name}\\s*:\\s*([^;]+);`).exec(block)?.[1]?.trim() ?? '';
  return blocks.map((b) => ({
    family: prop(b, 'font-family').replace(/^['"]|['"]$/g, ''),
    weight: prop(b, 'font-weight'),
    style: prop(b, 'font-style'),
    display: prop(b, 'font-display'),
    src: prop(b, 'src'),
  }));
}

describe('fonts.css (Roboto Mono self-hosted, ADR-09)', () => {
  const faces = parseFontFaces(read(FONTS_CSS));

  it('declara exatamente 3 @font-face Roboto Mono nos pesos 400, 500 e 700, normal, font-display swap', () => {
    expect(faces).toHaveLength(3);
    expect(faces.map((f) => f.family)).toEqual(['Roboto Mono', 'Roboto Mono', 'Roboto Mono']);
    expect(faces.map((f) => f.weight).sort()).toEqual(['400', '500', '700']);
    expect(faces.every((f) => f.style === 'normal')).toBe(true);
    expect(faces.every((f) => f.display === 'swap')).toBe(true);
  });

  it('cada src e URL relativa, sem http, format woff2, apontando para arquivo woff2 real (> 1KB)', () => {
    expect(faces).toHaveLength(3);
    for (const face of faces) {
      const match = /^url\(\s*(['"]?)([^'")]+)\1\s*\)\s*format\(\s*(['"])woff2\3\s*\)$/.exec(face.src);
      expect(match, `src invalido: "${face.src}"`).not.toBeNull();
      const url = match![2]!;
      expect(url).toMatch(/^\.{1,2}\//);
      expect(url).not.toContain('http');
      const file = resolve(dirname(FONTS_CSS), url);
      expect(existsSync(file), `arquivo ausente: ${file}`).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(1024);
      expect(readFileSync(file).subarray(0, 4).toString('latin1')).toBe('wOF2');
    }
  });

  it('inclui a licenca OFL ao lado das fontes', () => {
    expect(existsSync(OFL)).toBe(true);
    expect(read(OFL)).toContain('SIL OPEN FONT LICENSE');
  });
});

describe('tokens de fonte', () => {
  // Fonte da verdade: docs/figma/file.json, style.fontFamily "Roboto Mono" (linha 189).
  const css = read(TOKENS_CSS);
  const theme = /@theme\s*\{([\s\S]*)\}/.exec(css)?.[1] ?? '';
  const decl = (name: string) =>
    new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(theme)?.[1]?.trim();

  it.each(['--font-sans', '--font-mono'])('%s = "Roboto Mono", ui-monospace, monospace no @theme', (name) => {
    expect(decl(name)).toBe('"Roboto Mono", ui-monospace, monospace');
  });
});
