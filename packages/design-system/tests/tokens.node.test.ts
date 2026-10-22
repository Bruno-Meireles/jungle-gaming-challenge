import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const TOKENS_CSS = resolve(import.meta.dirname, '../src/styles/tokens.css');
const FIGMA_FILE = resolve(import.meta.dirname, '../../../docs/figma/file.json');

// Estilos FILL do Figma sem hex resolvivel (Lacuna Q11 do plano). Nao podem ter token inventado.
const GAPS = ['Text/Primary'];

type FigmaStyle = { name: string; styleType: string; description?: string };
type Declaration = { name: string; value: string; figma?: string };

// Tolerante: tokens.css ainda pode nao existir (RED deve falhar por asserção, não por ENOENT).
function readTokens(): string {
  return existsSync(TOKENS_CSS) ? readFileSync(TOKENS_CSS, 'utf8') : '';
}

// Extrai `--x: valor; /* figma:<id> */` (comentario opcional apos a declaracao).
function parseDeclarations(css: string): Declaration[] {
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);(?:[ \t]*\/\*\s*figma:([^*]*?)\s*\*\/)?/g;
  return [...css.matchAll(re)].map((m) => ({ name: m[1]!, value: m[2]!.trim(), figma: m[3] }));
}

type FigmaFile = { document: unknown; styles: Record<string, FigmaStyle> };
type Source = 'no' | 'description';
type ColorStyle = { id: string; style: FigmaStyle; hex?: string; source?: Source; nodeHexes: string[] };

function loadFigmaFile(): FigmaFile {
  return JSON.parse(readFileSync(FIGMA_FILE, 'utf8')) as FigmaFile;
}

function toHex(c: { r: number; g: number; b: number }): string {
  return '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Hex distintos do fill (fills[0] SOLID) dos nos que usam cada estilo FILL: fonte de verdade (o que o Figma renderiza).
function nodeFillHexes(root: unknown): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  const walk = (o: unknown): void => {
    if (!o || typeof o !== 'object') return;
    const node = o as { styles?: { fill?: string }; fills?: { type: string; color: { r: number; g: number; b: number } }[] };
    const first = Array.isArray(node.fills) ? node.fills[0] : undefined;
    if (node.styles?.fill && first?.type === 'SOLID') {
      const set = map.get(node.styles.fill) ?? new Set<string>();
      set.add(toHex(first.color));
      map.set(node.styles.fill, set);
    }
    for (const v of Object.values(o)) walk(v);
  };
  walk(root);
  return map;
}

// `Color/Primary Light` -> `--color-primary-light`; `Text/Accent` -> `--color-text-accent`.
function tokenName(styleName: string): string {
  const base = styleName.replace(/^Color\//, '');
  return `--color-${base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

// Anotacao da description ("#F5F1EB — vinculado à variavel ..."): so vale quando nenhum no usa o estilo.
function descriptionHex(style: FigmaStyle): string | undefined {
  return style.description?.match(/^(#[0-9A-Fa-f]{6})/)?.[1]?.toUpperCase();
}

function colorStyles(): ColorStyle[] {
  const file = loadFigmaFile();
  const used = nodeFillHexes(file.document);
  return Object.entries(file.styles)
    .filter(([, s]) => s.styleType === 'FILL')
    .map(([id, style]) => {
      const nodeHexes = [...(used.get(id) ?? [])];
      if (nodeHexes.length > 0) return { id, style, hex: nodeHexes.length === 1 ? nodeHexes[0] : undefined, source: 'no' as const, nodeHexes };
      const hex = descriptionHex(style);
      return { id, style, hex, source: hex ? ('description' as const) : undefined, nodeHexes };
    });
}

describe('tokens de cor (T9)', () => {
  const all = colorStyles();
  const withHex = all
    .filter((c) => c.hex !== undefined)
    .map((c) => ({
      figmaName: c.style.name,
      token: tokenName(c.style.name),
      hex: c.hex as string,
      origem: c.source === 'no' ? 'fill dos nos' : 'sem uso em nos: hex da description',
    }));

  it('nos que usam o mesmo estilo FILL nao divergem entre si', () => {
    const diverging = all.filter((c) => c.nodeHexes.length > 1).map((c) => [c.style.name, c.nodeHexes]);
    expect(diverging).toEqual([]);
  });

  it('o file.json tem estilos FILL com hex e exatamente as Lacunas declaradas sem hex', () => {
    const withoutHex = all.filter((c) => c.hex === undefined && c.nodeHexes.length === 0).map((c) => c.style.name);
    expect(withHex.length).toBeGreaterThan(0);
    expect(withoutHex).toEqual(GAPS);
  });

  it.each(withHex)('tokens.css declara $token: $hex ($figmaName; $origem)', ({ token, hex }) => {
    const decl = parseDeclarations(readTokens()).find((d) => d.name === token);
    expect(decl?.value.toUpperCase(), `tokens.css deve declarar ${token}: ${hex}`).toBe(hex);
  });

  it.each(GAPS)('Lacuna %s nao tem token inventado', (figmaName) => {
    const names = parseDeclarations(readTokens()).map((d) => d.name);
    expect(names).not.toContain(tokenName(figmaName));
  });
});

// Aliases semanticos do plano (§3): alias -> token Figma existente.
const ALIASES: [alias: string, target: string][] = [
  ['--color-background', '--color-ink'],
  ['--color-focus', '--color-primary'],
  ['--color-input-border', '--color-secondary'],
  ['--color-destructive-text', '--color-text-coral'],
  ['--color-destructive', '--color-error'],
];

describe('aliases semanticos de cor (T11)', () => {
  const colorDecls = () => parseDeclarations(readTokens()).filter((d) => d.name.startsWith('--color-'));

  it.each(ALIASES)('%s e declarado como var(%s)', (alias, target) => {
    const decl = colorDecls().find((d) => d.name === alias);
    expect(decl?.value, `tokens.css deve declarar ${alias}: var(${target})`).toBe(`var(${target})`);
  });

  it.each(ALIASES)('%s aponta para %s, token Figma declarado (com figma:)', (alias, target) => {
    const decls = colorDecls();
    const value = decls.find((d) => d.name === alias)?.value;
    expect(value, `${alias} deve existir`).toBeDefined();
    const referenced = value?.match(/^var\((--color-[a-z0-9-]+)\)$/)?.[1];
    expect(referenced).toBe(target);
    const targetDecl = decls.find((d) => d.name === referenced);
    expect(targetDecl?.figma, `${target} deve ter comentario figma:`).toBeTruthy();
  });

  it('alias nao contem hex literal e toda cor sem figma: e var(--color-...)', () => {
    const withoutFigma = colorDecls().filter((d) => !d.figma);
    const aliasNames = ALIASES.map(([a]) => a);
    const missing = aliasNames.filter((a) => !withoutFigma.some((d) => d.name === a));
    expect(missing, 'aliases ausentes em tokens.css').toEqual([]);
    expect(withoutFigma.filter((d) => d.value.includes('#') || !/^var\(--color-[a-z0-9-]+\)$/.test(d.value))).toEqual([]);
  });
});

// Tipografia (T12): tokens `--text-*` entram sob demanda. Convencao Tailwind 4:
// `--text-<n>` (font-size) + `--text-<n>--line-height|--font-weight|--letter-spacing`.
const TEXT_TOKENS: [token: string, styleId: string, styleName: string][] = [
  ['--text-body-14-bold-lh-16', '70321:354', 'Body/14 Bold · lh 16'],
];

type TextMetrics = { fontSize: number; fontWeight: number; lineHeightPx: number; lineHeightUnit: string; letterSpacing: number };

// Metricas distintas (JSON) dos nos de texto que usam cada estilo TEXT: fonte de verdade.
function nodeTextMetrics(root: unknown): Map<string, Map<string, TextMetrics>> {
  const map = new Map<string, Map<string, TextMetrics>>();
  const walk = (o: unknown): void => {
    if (!o || typeof o !== 'object') return;
    const node = o as { styles?: { text?: string }; style?: Partial<TextMetrics> };
    const s = node.style;
    if (node.styles?.text && s?.fontSize !== undefined) {
      const m: TextMetrics = {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight as number,
        lineHeightPx: s.lineHeightPx as number,
        lineHeightUnit: s.lineHeightUnit ?? 'INTRINSIC_%',
        letterSpacing: s.letterSpacing ?? 0,
      };
      const set = map.get(node.styles.text) ?? new Map<string, TextMetrics>();
      set.set(JSON.stringify(m), m);
      map.set(node.styles.text, set);
    }
    for (const v of Object.values(o)) walk(v);
  };
  walk(root);
  return map;
}

// Figma -> CSS: 'lh auto' (INTRINSIC_%) vira `normal`; letter-spacing 0 vira `0`, senao em.
function expectedCss(m: TextMetrics) {
  const em = (m.letterSpacing / m.fontSize).toFixed(4).replace(/\.?0+$/, '');
  return {
    size: `${m.fontSize}px`,
    lineHeight: m.lineHeightUnit === 'PIXELS' ? `${m.lineHeightPx}px` : 'normal',
    weight: String(m.fontWeight),
    letterSpacing: m.letterSpacing === 0 ? '0' : `${em}em`,
  };
}

describe('tokens de tipografia (T12)', () => {
  const file = loadFigmaFile();
  const used = nodeTextMetrics(file.document);

  it.each(TEXT_TOKENS)('%s: estilo %s (%s) existe como TEXT e seus nos nao divergem', (_token, styleId, styleName) => {
    expect(file.styles[styleId]?.styleType).toBe('TEXT');
    expect(file.styles[styleId]?.name).toBe(styleName);
    expect(used.get(styleId)?.size ?? 0, 'nos que usam o estilo').toBeGreaterThan(0);
    expect([...(used.get(styleId)?.values() ?? [])]).toHaveLength(1);
  });

  it.each(TEXT_TOKENS)('tokens.css declara %s (%s) com tamanho, line-height, peso e letter-spacing do Figma', (token, styleId) => {
    const m = [...(used.get(styleId)?.values() ?? [])][0];
    expect(m, `nos de ${styleId} no file.json`).toBeDefined();
    const want = expectedCss(m as TextMetrics);
    const decls = parseDeclarations(readTokens());
    const val = (n: string) => decls.find((d) => d.name === n)?.value;
    expect({
      size: val(token),
      lineHeight: val(`${token}--line-height`),
      weight: val(`${token}--font-weight`),
      letterSpacing: val(`${token}--letter-spacing`),
    }).toEqual(want);
  });

  it('todo --text-* base declarado tem /* figma:<styleId> */ de um estilo TEXT existente', () => {
    const base = parseDeclarations(readTokens()).filter((d) => d.name.startsWith('--text-') && !d.name.slice(2).includes('--'));
    expect(base.length, 'ao menos um --text-* declarado').toBeGreaterThan(0);
    const bad = base.filter((d) => !d.figma || file.styles[d.figma]?.styleType !== 'TEXT').map((d) => d.name);
    expect(bad).toEqual([]);
  });
});

// Raio, sombra e spacing (T13). Raios/sombras entram sob demanda; ADR-04: --spacing 1 unidade = 1px do Figma.
const RADIUS_TOKENS: [token: string, value: string, nodeId: string][] = [
  ['--radius-3', '3px', '70386:262'], // Button primario (Save Button), file.json:253196
  ['--radius-5', '5px', '70381:242'], // Input (Email Input), file.json:193043
];

type FigmaNode = {
  id?: string;
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  effects?: { type: string; visible?: boolean; color: { r: number; g: number; b: number; a: number }; offset: { x: number; y: number }; radius: number }[];
};

// Percorre o document ate achar o no com o id (undefined se nao existir).
function findNode(root: unknown, id: string): FigmaNode | undefined {
  if (!root || typeof root !== 'object') return undefined;
  if ((root as FigmaNode).id === id) return root as FigmaNode;
  for (const v of Object.values(root)) {
    const found = findNode(v, id);
    if (found) return found;
  }
  return undefined;
}

// Raio do no: cornerRadius, ou rectangleCornerRadii quando os 4 cantos sao iguais.
function nodeRadius(node: FigmaNode): number | undefined {
  if (node.cornerRadius !== undefined) return node.cornerRadius;
  const r = node.rectangleCornerRadii;
  return r && r.every((v) => v === r[0]) ? r[0] : undefined;
}

// `<x>px <y>px <blur>px rgba(r, g, b, a)` esperado para um DROP_SHADOW do Figma.
function expectedShadow(e: NonNullable<FigmaNode['effects']>[number]): string {
  const c = (v: number) => Math.round(v * 255);
  const a = Number(e.color.a.toFixed(2));
  return `${e.offset.x}px ${e.offset.y}px ${e.radius}px rgba(${c(e.color.r)}, ${c(e.color.g)}, ${c(e.color.b)}, ${a})`;
}

describe('tokens de raio, sombra e spacing (T13)', () => {
  const file = loadFigmaFile();
  const base = (prefix: string) =>
    parseDeclarations(readTokens()).filter((d) => d.name.startsWith(prefix) && !d.name.slice(2).includes('--') && d.value !== 'initial');

  it.each(RADIUS_TOKENS)('tokens.css declara %s: %s com /* figma:%s */', (token, value, nodeId) => {
    const decl = parseDeclarations(readTokens()).find((d) => d.name === token);
    expect({ value: decl?.value, figma: decl?.figma }).toEqual({ value, figma: nodeId });
  });

  it.each(RADIUS_TOKENS)('o no %2$s do file.json tem raio igual ao de %s', (token, value, nodeId) => {
    const node = findNode(file.document, nodeId);
    expect(node, `no ${nodeId} no file.json`).toBeDefined();
    expect(`${nodeRadius(node as FigmaNode)}px`).toBe(value);
  });

  it('todo --radius-* base declarado tem figma:<nodeId> existente cujo raio e igual ao valor', () => {
    const radii = base('--radius-');
    expect(radii.length, 'ao menos um --radius-* declarado').toBeGreaterThan(0);
    const bad = radii
      .filter((d) => {
        const node = d.figma ? findNode(file.document, d.figma) : undefined;
        return !node || `${nodeRadius(node)}px` !== d.value;
      })
      .map((d) => d.name);
    expect(bad).toEqual([]);
  });

  it('todo --shadow-* base declarado tem figma:<nodeId> existente com DROP_SHADOW igual ao valor', () => {
    const bad = base('--shadow-')
      .filter((d) => {
        const node = d.figma ? findNode(file.document, d.figma) : undefined;
        const shadows = (node?.effects ?? []).filter((e) => e.type === 'DROP_SHADOW' && e.visible !== false);
        return shadows.length === 0 || shadows.map(expectedShadow).join(', ') !== d.value;
      })
      .map((d) => d.name);
    expect(bad).toEqual([]);
  });

  it('--spacing: 1px declarado (ADR-04) sem comentario figma', () => {
    const decl = parseDeclarations(readTokens()).find((d) => d.name === '--spacing');
    expect({ value: decl?.value, figma: decl?.figma }).toEqual({ value: '1px', figma: undefined });
  });
});
