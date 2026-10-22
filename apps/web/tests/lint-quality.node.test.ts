import { resolve } from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '../../..');

const eslint = new ESLint({
  cwd: ROOT,
  overrideConfigFile: resolve(ROOT, 'eslint.config.js'),
});

async function lint(code: string, relPath: string) {
  const [result] = await eslint.lintText(code, { filePath: resolve(ROOT, relPath) });
  return result?.messages ?? [];
}

async function ruleIds(code: string, relPath: string) {
  const messages = await lint(code, relPath);
  return messages.map((m) => m.ruleId);
}

const TS = 'apps/web/src/shared/lib/x.ts';
const TSX = 'apps/web/src/widgets/x/ui/X.tsx';
const TEST = 'apps/web/src/shared/lib/x.test.ts';
const DS = 'packages/design-system/src/primitives/x/X.ts';

const lines = (count: number, make: (i: number) => string) =>
  Array.from({ length: count }, (_, i) => make(i)).join('\n');

// n ifs => complexidade n + 1
function complexity(total: number) {
  return `export function f(a: number) {\n${lines(total - 1, (i) => `  if (a === ${i}) return ${i};`)}\n  return 0;\n}\n`;
}

// ifs aninhados: `depth` niveis de bloco dentro da funcao
function nesting(depth: number) {
  const open = lines(depth, (i) => `${'  '.repeat(i + 1)}if (a > ${i}) {`);
  const close = lines(depth, (i) => `${'  '.repeat(depth - i)}}`);
  return `export function f(a: number) {\n${open}\n${'  '.repeat(depth + 1)}a.toFixed();\n${close}\n}\n`;
}

function params(count: number) {
  const list = Array.from({ length: count }, (_, i) => `p${i}: number`).join(', ');
  return `export function f(${list}) {\n  return 0;\n}\n`;
}

function callbacks(count: number) {
  // `count` funcoes aninhadas passadas como argumento
  let expr = 'cb(1)';
  for (let i = 0; i < count; i += 1) expr = `cb(() => ${expr})`;
  return `declare function cb(fn: unknown): void;\nexport const run = () => {\n  ${expr};\n};\n`;
}

// `count` linhas de codigo, intercaladas com vazias e comentarios (que nao contam)
function codeLines(count: number) {
  const body = lines(count, (i) => `export const v${i} = ${i};\n\n// comentario ${i}`);
  return `${body}\n`;
}

// funcao com exatamente `total` linhas (declaracao + corpo + fechamento)
function functionOfLines(total: number) {
  return `export function f() {\n  let x = 0;\n${lines(total - 4, () => '  x += 1;')}\n  return x;\n}\n`;
}

describe('qualidade de codigo em apps/web/src (lint ADR-21)', () => {
  describe.each([
    ['complexity', 'complexidade ciclomatica', complexity(11), complexity(10)],
    ['max-depth', 'aninhamento de blocos', nesting(4), nesting(3)],
    ['max-params', 'parametros', params(4), params(3)],
    ['max-nested-callbacks', 'callbacks aninhados', callbacks(4), callbacks(3)],
    ['max-lines', 'linhas de arquivo', codeLines(201), codeLines(200)],
    ['max-lines-per-function', 'linhas por funcao', functionOfLines(81), functionOfLines(80)],
  ])('%s', (rule, what, rejected, accepted) => {
    it(`reprova ${what} acima do limite`, async () => {
      expect(await ruleIds(rejected, TS)).toContain(rule);
    });

    it(`aceita ${what} no limite`, async () => {
      expect(await ruleIds(accepted, TS)).not.toContain(rule);
    });
  });

  it('reprova any explicito', async () => {
    const ids = await ruleIds('export const a: any = 1;\n', TS);

    expect(ids).toContain('@typescript-eslint/no-explicit-any');
  });

  it('reprova asserção de tipo `as X` com no-restricted-syntax', async () => {
    const ids = await ruleIds(
      'declare const b: unknown;\ntype Foo = { a: 1 };\nexport const a = b as Foo;\n',
      TS,
    );

    expect(ids).toContain('no-restricted-syntax');
  });

  it('aceita `as const`', async () => {
    const ids = await ruleIds("export const a = { k: 'v' } as const;\n", TS);

    expect(ids).not.toContain('no-restricted-syntax');
  });

  // Exaustividade de switch sobre uniao nao e testada por lint: a regra e type-aware e o helper
  // usa arquivos virtuais. Ela e garantida em compilacao por `assertNever` + `tsc` (desvio do
  // plano registrado em ADR-21).

  it('reporta os dois usos de no-restricted-syntax (i18n e asserção) no mesmo .tsx', async () => {
    const code =
      'declare const b: unknown;\ntype Foo = { a: 1 };\nexport function X() {\n  const a = b as Foo;\n  return <p title={String(a)}>Olá</p>;\n}\n';

    const messages = (await lint(code, TSX)).filter((m) => m.ruleId === 'no-restricted-syntax');

    expect(messages.some((m) => /i18n/.test(m.message))).toBe(true);
    expect(messages.length).toBeGreaterThanOrEqual(2);
  });

  describe('arquivos de teste', () => {
    it('aceita arquivo .test.ts com 300 linhas', async () => {
      expect(
        await ruleIds(
          lines(300, (i) => `export const v${i} = ${i};`),
          TEST,
        ),
      ).not.toContain('max-lines');
    });

    it('reprova arquivo .test.ts com 401 linhas', async () => {
      expect(
        await ruleIds(
          lines(401, (i) => `export const v${i} = ${i};`),
          TEST,
        ),
      ).toContain('max-lines');
    });
  });

  describe('design system', () => {
    it('nao recebe os limites do app (complexity 11 passa)', async () => {
      expect(await ruleIds(complexity(11), DS)).not.toContain('complexity');
    });
  });
});
