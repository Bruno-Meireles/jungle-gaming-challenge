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

const TEST_FILES = [
  'packages/design-system/src/primitives/button/Button.test.tsx',
  'packages/design-system/tests/x.node.test.ts',
  'packages/design-system/golden/golden.spec.ts',
];

// Pares montados em runtime para este arquivo nao conter modificadores reais.
const FORBIDDEN: Array<[string, string]> = [
  ['it', 'only'],
  ['it', 'skip'],
  ['test', 'only'],
  ['test', 'skip'],
  ['test', 'fixme'],
  ['describe', 'only'],
  ['describe', 'skip'],
];

describe('higiene de testes (lint)', () => {
  const cases = FORBIDDEN.flatMap(([obj, prop]) =>
    TEST_FILES.map((file) => [`${obj}.${prop}`, file, obj, prop] as const),
  );

  it.each(cases)(
    'reporta no-restricted-properties para %s em %s',
    async (_label, file, obj, prop) => {
      const messages = await lint(`${obj}.${prop}('x', () => {});\n`, file);

      expect(messages.map((m) => m.ruleId)).toContain('no-restricted-properties');
    },
  );

  it.each(TEST_FILES)('nao reporta no-restricted-properties para it e describe normais em %s', async (file) => {
    const messages = await lint("it('x', () => {});\ndescribe('y', () => {});\n", file);

    expect(messages.map((m) => m.ruleId)).not.toContain('no-restricted-properties');
  });
});
