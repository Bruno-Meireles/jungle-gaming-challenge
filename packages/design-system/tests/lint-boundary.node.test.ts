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

describe('fronteira do design system (lint)', () => {
  it('reporta no-restricted-imports para import de @jg/web dentro do design system', async () => {
    const messages = await lint("import '@jg/web';\n", 'packages/design-system/src/x.ts');

    expect(messages.map((m) => m.ruleId)).toContain('no-restricted-imports');
  });

  it.each([
    '@tanstack/react-query',
    '@tanstack/react-query/devtools',
    '@tanstack/react-router',
    'axios',
    'msw',
    'socket.io-client',
  ])('reporta no-restricted-imports para import de %s dentro do design system', async (mod) => {
    const messages = await lint(`import '${mod}';\n`, 'packages/design-system/src/x.ts');

    expect(messages.map((m) => m.ruleId)).toContain('no-restricted-imports');
  });
});

describe('camadas internas do design system (lint)', () => {
  it.each(['../../patterns/nft-card', '../../patterns'])(
    'reporta no-restricted-imports para primitive importando %s',
    async (mod) => {
      const messages = await lint(
        `import { NftCard } from '${mod}';\nexport const x = NftCard;\n`,
        'packages/design-system/src/primitives/button/Button.tsx',
      );

      expect(messages.map((m) => m.ruleId)).toContain('no-restricted-imports');
    },
  );

  it('nao reporta no-restricted-imports para pattern importando primitives', async () => {
    const messages = await lint(
      "import { Button } from '../../primitives/button';\nexport const x = Button;\n",
      'packages/design-system/src/patterns/nft-card/NftCard.tsx',
    );

    expect(messages.map((m) => m.ruleId)).not.toContain('no-restricted-imports');
  });

  it('nao reporta no-restricted-imports para primitive importando lib/cn', async () => {
    const messages = await lint(
      "import { cn } from '../../lib/cn';\nexport const x = cn;\n",
      'packages/design-system/src/primitives/button/Button.tsx',
    );

    expect(messages.map((m) => m.ruleId)).not.toContain('no-restricted-imports');
  });
});

describe('acesso a slices via index.ts (lint)', () => {
  it.each([
    ['../../primitives/button/Button', 'packages/design-system/src/patterns/nft-card/NftCard.tsx'],
    ['../button/Button', 'packages/design-system/src/primitives/password-input/PasswordInput.tsx'],
    ['./primitives/button/Button', 'packages/design-system/src/index.ts'],
    ['../../patterns/nft-card/NftCard', 'packages/design-system/src/x.ts'],
  ])('reporta no-restricted-imports para deep import %s', async (mod, file) => {
    const messages = await lint(`import { X } from '${mod}';\nexport const x = X;\n`, file);

    expect(messages.map((m) => m.ruleId)).toContain('no-restricted-imports');
  });

  it.each([
    ['../../primitives/button', 'packages/design-system/src/patterns/nft-card/NftCard.tsx'],
    ['./Button', 'packages/design-system/src/primitives/button/Button.test.tsx'],
    ['./primitives/button', 'packages/design-system/src/index.ts'],
  ])('nao reporta no-restricted-imports para %s', async (mod, file) => {
    const messages = await lint(`import { X } from '${mod}';\nexport const x = X;\n`, file);

    expect(messages.map((m) => m.ruleId)).not.toContain('no-restricted-imports');
  });
});
