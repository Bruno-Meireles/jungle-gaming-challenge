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

/// Tipografia (T12, generalizado no GATE-TOKENS): UM token `--text-<slug do estilo>` para CADA estilo TEXT do file.json.
// Convencao Tailwind 4: `--text-<n>` (font-size) + `--text-<n>--line-height|--font-weight|--letter-spacing`.
// `Body/14 Bold · lh 16` -> `--text-body-14-bold-lh-16`; `ls 0%` -> `ls-0`.
function textSlug(styleName: string): string {
  return `--text-${styleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

const TEXT_STYLES: [token: string, styleId: string, styleName: string][] = Object.entries(loadFigmaFile().styles)
  .filter(([, s]) => s.styleType === 'TEXT')
  .map(([id, s]) => [textSlug(s.name), id, s.name]);

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

// Estilo sem uso em nos: metricas da description `combo:<size>|<peso>|<lh>px|<ls>%` (lh auto -> INTRINSIC_%).
const WEIGHTS: Record<string, number> = { Thin: 100, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 };
function descriptionMetrics(style: FigmaStyle): TextMetrics | undefined {
  const m = style.description?.match(/^combo:(\d+(?:\.\d+)?)\|(\w+)\|(auto|\d+(?:\.\d+)?px)\|(-?[\d.]+)%/);
  if (!m || WEIGHTS[m[2]!] === undefined) return undefined;
  const size = Number(m[1]);
  const px = m[3]!.endsWith('px');
  return {
    fontSize: size,
    fontWeight: WEIGHTS[m[2]!]!,
    lineHeightPx: px ? Number.parseFloat(m[3]!) : 0,
    lineHeightUnit: px ? 'PIXELS' : 'INTRINSIC_%',
    letterSpacing: (Number(m[4]) / 100) * size,
  };
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

describe('tokens de tipografia (T12, todos os estilos TEXT)', () => {
  const file = loadFigmaFile();
  const used = nodeTextMetrics(file.document);
  const metricsOf = (id: string): TextMetrics | undefined => [...(used.get(id)?.values() ?? [])][0] ?? descriptionMetrics(file.styles[id]!);

  it('o file.json tem 59 estilos TEXT e os nomes de token nao colidem', () => {
    expect(TEXT_STYLES).toHaveLength(59);
    const tokens = TEXT_STYLES.map(([t]) => t);
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it.each(TEXT_STYLES)('%s: estilo %s (%s) tem metricas consistentes (nos nao divergem; sem uso: description)', (_token, styleId) => {
    expect(used.get(styleId)?.size ?? 0, 'metricas distintas entre os nos').toBeLessThanOrEqual(1);
    expect(metricsOf(styleId), `metricas de ${styleId}`).toBeDefined();
  });

  it.each(TEXT_STYLES)('tokens.css declara %s (%s) com tamanho, line-height, peso e letter-spacing do Figma', (token, styleId) => {
    const m = metricsOf(styleId);
    expect(m, `metricas de ${styleId}`).toBeDefined();
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

  it.each(TEXT_STYLES)('%s declara /* figma:%s */', (token, styleId) => {
    expect(parseDeclarations(readTokens()).find((d) => d.name === token)?.figma).toBe(styleId);
  });

  it('inventario: o conjunto de --text-* base == os estilos TEXT (nenhum faltando, nenhum inventado)', () => {
    const base = parseDeclarations(readTokens())
      .filter((d) => d.name.startsWith('--text-') && !d.name.slice(2).includes('--') && d.value !== 'initial')
      .map((d) => d.name)
      .sort();
    expect(base).toEqual(TEXT_STYLES.map(([t]) => t).sort());
  });

  it('todo --text-* base declarado tem /* figma:<styleId> */ de um estilo TEXT existente', () => {
    const base = parseDeclarations(readTokens()).filter((d) => d.name.startsWith('--text-') && !d.name.slice(2).includes('--') && d.value !== 'initial');
    expect(base.length, 'ao menos um --text-* declarado').toBeGreaterThan(0);
    const bad = base.filter((d) => !d.figma || file.styles[d.figma]?.styleType !== 'TEXT').map((d) => d.name);
    expect(bad).toEqual([]);
  });
});

// Raio, sombra e spacing (T13, generalizado no GATE-TOKENS); ADR-04: --spacing 1 unidade = 1px do Figma.
// Raio: todo `cornerRadius` distinto de nos (ou rectangleCornerRadii com 4 cantos iguais) vira `--radius-<valor>`,
// valor arredondado a 2 casas, ponto decimal como `p` (2.118... -> `--radius-2p12`).
const round2 = (n: number): number => Number(n.toFixed(2));
const radiusToken = (r: number): string => `--radius-${String(round2(r)).replace('.', 'p')}`;
const radiusValue = (r: number): string => `${round2(r)}px`;

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

// Inventario: raio (arredondado) -> id do primeiro no que o usa; cantos assimetricos (Lacunas) -> id do primeiro no.
function radiusInventory(root: unknown): { uniform: Map<number, string>; asymmetric: Map<string, string> } {
  const uniform = new Map<number, string>();
  const asymmetric = new Map<string, string>();
  const walk = (o: unknown): void => {
    if (!o || typeof o !== 'object') return;
    const node = o as FigmaNode;
    if (node.id !== undefined) {
      const r = nodeRadius(node);
      if (r !== undefined) {
        if (!uniform.has(round2(r))) uniform.set(round2(r), node.id);
      } else if (node.rectangleCornerRadii && !asymmetric.has(node.rectangleCornerRadii.join(','))) {
        asymmetric.set(node.rectangleCornerRadii.join(','), node.id);
      }
    }
    for (const v of Object.values(o)) walk(v);
  };
  walk(root);
  return { uniform, asymmetric };
}

// Lacunas: cantos assimetricos [tl,tr,br,bl] sem token (nao ha como expressa-los num unico `--radius-*`).
const ASYMMETRIC_GAPS = ['0,3,3,0', '0,6,6,0', '14,0,0,14', '31,31,0,0', '40,40,0,0'];

// `<x>px <y>px <blur>px rgba(r, g, b, a)` esperado para um DROP_SHADOW do Figma.
function expectedShadow(e: NonNullable<FigmaNode['effects']>[number]): string {
  const c = (v: number) => Math.round(v * 255);
  const a = Number(e.color.a.toFixed(2));
  return `${e.offset.x}px ${e.offset.y}px ${e.radius}px rgba(${c(e.color.r)}, ${c(e.color.g)}, ${c(e.color.b)}, ${a})`;
}

describe('tokens de raio, sombra e spacing (T13)', () => {
  const file = loadFigmaFile();
  const inventory = radiusInventory(file.document);
  const RADII = [...inventory.uniform.entries()].sort((a, b) => a[0] - b[0]);
  const base = (prefix: string) =>
    parseDeclarations(readTokens()).filter((d) => d.name.startsWith(prefix) && !d.name.slice(2).includes('--') && d.value !== 'initial');

  it('o file.json tem 29 raios uniformes distintos e as 5 Lacunas de cantos assimetricos', () => {
    expect(RADII).toHaveLength(29);
    expect([...inventory.asymmetric.keys()].sort()).toEqual(ASYMMETRIC_GAPS);
  });

  // O comentario figma: pode ser qualquer no que use o raio (representativo); o teste abaixo confere que ele existe e bate.
  it.each(RADII)('tokens.css declara o raio %s (ex.: no %s) com figma:<nodeId>', (radius) => {
    const decl = parseDeclarations(readTokens()).find((d) => d.name === radiusToken(radius));
    expect({ value: decl?.value, hasFigma: Boolean(decl?.figma) }).toEqual({ value: radiusValue(radius), hasFigma: true });
  });

  it('inventario: o conjunto de --radius-* base == o conjunto de raios dos nos (nenhum faltando, nenhum inventado)', () => {
    expect(base('--radius-').map((d) => d.name).sort()).toEqual(RADII.map(([r]) => radiusToken(r)).sort());
  });

  it('Lacunas de cantos assimetricos nao viram token', () => {
    const names = base('--radius-').map((d) => d.name);
    expect(names.filter((n) => /--radius-(tl|tr|br|bl|top|bottom|left|right)/.test(n))).toEqual([]);
  });

  it('todo --radius-* base declarado tem figma:<nodeId> existente cujo raio e igual ao valor', () => {
    const radii = base('--radius-');
    expect(radii.length, 'ao menos um --radius-* declarado').toBeGreaterThan(0);
    const bad = radii
      .filter((d) => {
        const node = d.figma ? findNode(file.document, d.figma) : undefined;
        const r = node ? nodeRadius(node) : undefined;
        return r === undefined || radiusValue(r) !== d.value || radiusToken(r) !== d.name;
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
