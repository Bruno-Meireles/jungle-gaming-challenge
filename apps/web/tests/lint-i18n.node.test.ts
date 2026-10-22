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

const FILE = 'apps/web/src/widgets/x/ui/X.tsx';

function component(jsx: string) {
  return `export function X({ t, n }: { t: (k: string) => string; n: number }) {\n  return ${jsx};\n}\n`;
}

async function ruleIds(jsx: string, relPath = FILE) {
  const messages = await lint(component(jsx), relPath);
  return messages.map((m) => m.ruleId);
}

describe('textos hardcoded em JSX (lint i18n)', () => {
  it.each([
    ['JSXText pt-BR', '<p>Olá</p>'],
    ['JSXText en', '<b>Hello</b>'],
    ['aria-label literal', '<button aria-label="Fechar" />'],
    ['aria-description literal', '<button aria-description="Fecha o painel" />'],
    ['alt literal', '<img alt="Foto" />'],
    ['title literal', '<span title="x a" />'],
    ['placeholder literal', '<input placeholder="Buscar" />'],
    ['label literal', '<Field label="Nome" />'],
    ['aria-label com expressao literal', "<button aria-label={'Next'} />"],
    ['template literal dentro de JSX', '<p>{`oi ${n}`}</p>'],
  ])('reporta no-restricted-syntax para %s', async (_name, jsx) => {
    expect(await ruleIds(jsx)).toContain('no-restricted-syntax');
  });

  it.each([
    ['chave via t() como filho', "<p>{t('chave')}</p>"],
    ['aria-label via t()', "<button aria-label={t('k')} />"],
    ['glifo sem letra: barra', '<span aria-hidden="true">/</span>'],
    ['glifo sem letra: asterisco', '<span aria-hidden="true">*</span>'],
    ['glifo sem letra: travessao', '<span aria-hidden="true">—</span>'],
    ['digitos', '<span>123</span>'],
    ['className literal', '<div className="a b" />'],
    ['data-slot literal', '<div data-slot="x" />'],
    ['type literal', '<button type="button" />'],
  ])('nao reporta no-restricted-syntax para %s', async (_name, jsx) => {
    expect(await ruleIds(jsx)).not.toContain('no-restricted-syntax');
  });

  it.each([
    ['arquivo .test.tsx', 'apps/web/src/widgets/x/ui/X.test.tsx'],
    ['e2e', 'apps/web/e2e/home.tsx'],
    ['mocks', 'apps/web/src/mocks/Fake.tsx'],
  ])('isenta %s de texto literal', async (_name, relPath) => {
    const ids = await ruleIds('<button aria-label="Fechar">Olá</button>', relPath);

    expect(ids).not.toContain('no-restricted-syntax');
  });

  it('mantem o no-restricted-syntax de test.describe.only em arquivo .test.tsx', async () => {
    const messages = await lint(
      "test.describe.only('x', () => {});\n",
      'apps/web/src/widgets/x/ui/X.test.tsx',
    );

    expect(messages.map((m) => m.ruleId)).toContain('no-restricted-syntax');
  });
});
