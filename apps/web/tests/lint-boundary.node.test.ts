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

describe('fronteira do app com o design system (lint)', () => {
  it.each(['@jg/design-system/src/primitives/button', '@jg/design-system/dist/index.js'])(
    'reporta no-restricted-imports para import profundo de %s dentro de apps/web/src',
    async (mod) => {
      const messages = await lint(`import '${mod}';\n`, 'apps/web/src/x.ts');

      expect(messages.map((m) => m.ruleId)).toContain('no-restricted-imports');
    },
  );

  it('nao reporta no-restricted-imports para o entrypoint publico @jg/design-system', async () => {
    const messages = await lint(
      "import { Button } from '@jg/design-system';\nexport const x = Button;\n",
      'apps/web/src/x.ts',
    );

    expect(messages.map((m) => m.ruleId)).not.toContain('no-restricted-imports');
  });

  it('nao reporta no-restricted-imports para @jg/design-system/styles.css', async () => {
    const messages = await lint("import '@jg/design-system/styles.css';\n", 'apps/web/src/x.ts');

    expect(messages.map((m) => m.ruleId)).not.toContain('no-restricted-imports');
  });
});
