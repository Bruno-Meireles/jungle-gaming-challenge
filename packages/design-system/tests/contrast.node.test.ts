import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Guarda de contraste (T18): razoes calculadas a partir dos tokens, seguindo aliases.
// `JG_TOKENS_CSS` permite apontar para uma copia (prova de deteccao por mutacao).
const TOKENS_CSS = process.env.JG_TOKENS_CSS ?? resolve(import.meta.dirname, '../src/styles/tokens.css');

// Valores calculados nos tokens atuais (fundo ink #140D0A):
//   foreground #F5F1EB x ink       = 17.10:1 (>= 4.5)
//   destructive-text #F0805F x ink =  7.29:1 (>= 4.5)
//   input-border #B39463 x ink     =  6.72:1 (>= 3.0)
//   focus #D28A4C x ink            =  6.85:1 (>= 3.0)
//   registro sem asserção: error #ED1B2E x ink = 4.39:1

function readDeclarations(css: string): Map<string, string> {
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
  return new Map([...css.matchAll(re)].map((m) => [m[1]!, m[2]!.trim()]));
}

// Segue `var(--x)` ate um hex literal.
function resolveColor(decls: Map<string, string>, name: string): string {
  let current = name;
  for (let i = 0; i < 10; i++) {
    const value = decls.get(current);
    if (value === undefined) throw new Error(`token ${current} nao declarado (resolvendo ${name})`);
    const ref = value.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];
    if (!ref) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(value)) throw new Error(`${current} nao resolve para hex: ${value}`);
      return value.toUpperCase();
    }
    current = ref;
  }
  throw new Error(`alias circular ou profundo demais: ${name}`);
}

// WCAG 2.x: luminancia relativa (sRGB) e razao de contraste.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('funcao de contraste WCAG', () => {
  it('preto x branco = 21', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });

  it('#777777 x branco ~ 4.48 (abaixo de 4.5)', () => {
    const ratio = contrastRatio('#777777', '#FFFFFF');
    expect(ratio).toBeCloseTo(4.48, 2);
    expect(ratio).toBeLessThan(4.5);
  });

  it('mesma cor = 1', () => {
    expect(contrastRatio('#B39463', '#B39463')).toBe(1);
  });
});

describe('contraste dos tokens sobre --color-background (T18)', () => {
  const decls = readDeclarations(readFileSync(TOKENS_CSS, 'utf8'));
  const ratioOf = (token: string) => contrastRatio(resolveColor(decls, token), resolveColor(decls, '--color-background'));

  it('--color-destructive-text x background >= 4.5 (texto, WCAG 1.4.3)', () => {
    expect(ratioOf('--color-destructive-text')).toBeGreaterThanOrEqual(4.5);
  });

  it('--color-foreground x background >= 4.5 (texto, WCAG 1.4.3)', () => {
    expect(ratioOf('--color-foreground')).toBeGreaterThanOrEqual(4.5);
  });

  it('--color-input-border x background >= 3.0 (componente de UI, WCAG 1.4.11)', () => {
    expect(ratioOf('--color-input-border')).toBeGreaterThanOrEqual(3.0);
  });

  it('--color-focus x background >= 3.0 (indicador de foco, WCAG 1.4.11)', () => {
    expect(ratioOf('--color-focus')).toBeGreaterThanOrEqual(3.0);
  });

  it('--color-text-muted x background >= 4.5 (texto, WCAG 1.4.3)', () => {
    expect(ratioOf('--color-text-muted')).toBeGreaterThanOrEqual(4.5);
  });

  it('--color-accent x background >= 3.0 (componente de UI, WCAG 1.4.11)', () => {
    expect(ratioOf('--color-accent')).toBeGreaterThanOrEqual(3.0);
  });

  it.each(['--color-primary', '--color-primary-hover', '--color-primary-active'])(
    'texto --color-ink sobre %s >= 4.5 (texto de botao, WCAG 1.4.3)',
    (bg) => {
      expect(contrastRatio(resolveColor(decls, '--color-ink'), resolveColor(decls, bg))).toBeGreaterThanOrEqual(4.5);
    },
  );

  // Desvio registrado: disabled-text (secondary #B39463) x disabled-bg (border-soft #55321F) = 3.94:1 (< 4.5).
  // Texto desabilitado e isento do WCAG 1.4.3; exigimos >= 3.0 para nao sumir e documentamos em docs/design-tokens.md.
  it('--color-disabled-text x --color-disabled-bg >= 3.0 (isento de 1.4.3; razao real registrada)', () => {
    const ratio = contrastRatio(resolveColor(decls, '--color-disabled-text'), resolveColor(decls, '--color-disabled-bg'));
    console.info(`disabled-text x disabled-bg = ${ratio.toFixed(2)}:1`);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it('registro: razoes calculadas (sem asserção sobre error)', () => {
    const report = Object.fromEntries(
      ['--color-foreground', '--color-destructive-text', '--color-input-border', '--color-focus', '--color-error'].map((t) => [
        t,
        `${resolveColor(decls, t)} = ${ratioOf(t).toFixed(2)}:1`,
      ]),
    );
    console.info(JSON.stringify(report, null, 2));
    expect(Object.keys(report)).toHaveLength(5);
  });
});
