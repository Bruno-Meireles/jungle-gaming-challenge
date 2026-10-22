import { expect } from 'vitest';
import measures from '../figma/measures.json';

type Measure = { value: unknown; node: string; source: string; ref?: string };
const table = measures as Record<string, Measure>;

/** Valor lido de docs/figma/file.json (gerado por tests/figma/extract-measures.mjs) com a citacao arquivo:linha. */
export function figma<T = number>(key: string): { value: T; cite: string } {
  const m = table[key];
  if (!m) throw new Error(`medida ${key} nao extraida do Figma`);
  return { value: m.value as T, cite: `${key} = ${JSON.stringify(m.value)} [${m.source}, no ${m.node}]` };
}

/** Compara medida em px com tolerancia (arredondamento de fonte/subpixel). Divergencia real falha com esperado x observado. */
export function expectPx(actual: number, key: string, scale = 1, tolerance = 0.6): void {
  const { value, cite } = figma(key);
  const expected = value * scale;
  const ok = Math.abs(actual - expected) <= tolerance;
  expect.soft(ok ? expected : actual, `${cite} (esperado ${expected}px)`).toBe(expected);
}

export function px(css: string): number {
  return Number.parseFloat(css);
}

let canvas: CanvasRenderingContext2D | undefined;
/** Normaliza qualquer cor CSS computada (rgb, oklch, color()) para #rrggbb. */
export function toHex(css: string): string {
  canvas ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true }) ?? undefined;
  if (!canvas) throw new Error('canvas 2d indisponivel');
  canvas.clearRect(0, 0, 1, 1);
  canvas.fillStyle = '#000000';
  canvas.fillStyle = css;
  canvas.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = canvas.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function expectColor(actualCss: string, key: string): void {
  const { value, cite } = figma<string>(key);
  expect.soft(toHex(actualCss), cite).toBe(value);
}

export function expectExact(actual: unknown, key: string): void {
  const { value, cite } = figma<unknown>(key);
  expect.soft(actual, cite).toBe(value);
}
