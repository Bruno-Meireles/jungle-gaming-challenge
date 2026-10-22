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

async function ruleIds(importPath: string, relPath: string) {
  const messages = await lint(`import '${importPath}';\n`, relPath);
  return messages.map((m) => m.ruleId);
}

const SRC = 'apps/web/src';

describe('direcao de dependencia entre camadas FSD (lint)', () => {
  it.each([
    ['shared', 'entities'],
    ['shared', 'features'],
    ['shared', 'widgets'],
    ['shared', 'pages'],
    ['shared', 'app'],
    ['entities', 'features'],
    ['entities', 'widgets'],
    ['entities', 'pages'],
    ['entities', 'app'],
    ['features', 'widgets'],
    ['features', 'pages'],
    ['features', 'app'],
    ['widgets', 'pages'],
    ['widgets', 'app'],
    ['pages', 'app'],
  ])('reporta no-restricted-imports quando %s importa de %s', async (from, to) => {
    const ids = await ruleIds(`../../${to}/some-slice`, `${SRC}/${from}/some-slice/x.ts`);

    expect(ids).toContain('no-restricted-imports');
  });

  it.each([
    ['widgets', 'features'],
    ['widgets', 'entities'],
    ['widgets', 'shared'],
    ['features', 'entities'],
    ['features', 'shared'],
    ['entities', 'shared'],
    ['pages', 'widgets'],
    ['pages', 'shared'],
    ['app', 'pages'],
    ['app', 'widgets'],
    ['app', 'features'],
    ['app', 'entities'],
    ['app', 'shared'],
  ])('nao reporta no-restricted-imports quando %s importa de %s pelo index', async (from, to) => {
    const ids = await ruleIds(`../../${to}/other-slice`, `${SRC}/${from}/some-slice/x.ts`);

    expect(ids).not.toContain('no-restricted-imports');
  });
});

describe('slices irmaos da mesma camada (lint)', () => {
  it.each([
    ['features', 'catalog-search', 'catalog-sort'],
    ['entities', 'nft', 'collection'],
    ['widgets', 'hero', 'footer'],
    ['pages', 'home', 'login'],
  ])('reporta no-restricted-imports quando slice %s/%s importa do irmao %s', async (layer, a, b) => {
    const ids = await ruleIds(`../${b}`, `${SRC}/${layer}/${a}/x.ts`);

    expect(ids).toContain('no-restricted-imports');
  });

  it('reporta no-restricted-imports para irmao via caminho mais longo da mesma camada', async () => {
    const ids = await ruleIds('../../../features/catalog-sort', `${SRC}/features/catalog-search/ui/x.ts`);

    expect(ids).toContain('no-restricted-imports');
  });

  it('nao reporta no-restricted-imports para import dentro do proprio slice', async () => {
    const ids = await ruleIds('../model/state', `${SRC}/features/catalog-search/ui/x.ts`);

    expect(ids).not.toContain('no-restricted-imports');
  });
});

describe('acesso a slices apenas pelo index.ts (lint)', () => {
  it.each(['../../entities/nft/model/domain/x', '../../entities/nft/ui/NftCard'])(
    'reporta no-restricted-imports para deep import %s',
    async (mod) => {
      const ids = await ruleIds(mod, `${SRC}/features/catalog-search/x.ts`);

      expect(ids).toContain('no-restricted-imports');
    },
  );

  it('nao reporta no-restricted-imports para o index do slice', async () => {
    const ids = await ruleIds('../../entities/nft', `${SRC}/features/catalog-search/x.ts`);

    expect(ids).not.toContain('no-restricted-imports');
  });
});

describe('dominio e shared/lib sem frameworks (lint)', () => {
  const libs = ['react', 'react/jsx-runtime', 'axios', '@tanstack/react-query', 'msw', 'i18next', 'react-i18next'];
  const restrictedPaths = [`${SRC}/entities/nft/model/domain/x.ts`, `${SRC}/shared/lib/x.ts`];

  for (const file of restrictedPaths) {
    it.each(libs)(`reporta no-restricted-imports para %s em ${file}`, async (lib) => {
      const ids = await ruleIds(lib, file);

      expect(ids).toContain('no-restricted-imports');
    });
  }

  it.each([`${SRC}/widgets/hero/x.ts`, `${SRC}/app/x.ts`])(
    'nao reporta no-restricted-imports para react, axios, @tanstack/react-query, msw e i18next em %s',
    async (file) => {
      for (const lib of ['react', 'axios', '@tanstack/react-query', 'msw', 'i18next', 'react-i18next']) {
        expect(await ruleIds(lib, file)).not.toContain('no-restricted-imports');
      }
    },
  );
});

describe('camada de mocks (lint)', () => {
  it.each([`${SRC}/pages/home/x.ts`, `${SRC}/widgets/hero/x.ts`, `${SRC}/shared/api/x.ts`, `${SRC}/app/x.ts`])(
    'reporta no-restricted-imports ao importar mocks fora de app/bootstrap em %s',
    async (file) => {
      const depth = file.split('/').length - 4; // niveis de pasta entre o arquivo e apps/web/src
      const ids = await ruleIds(`${'../'.repeat(depth)}mocks`, file);

      expect(ids).toContain('no-restricted-imports');
    },
  );

  it('nao reporta no-restricted-imports ao importar mocks dentro de app/bootstrap', async () => {
    const ids = await ruleIds('../../mocks', `${SRC}/app/bootstrap/x.ts`);

    expect(ids).not.toContain('no-restricted-imports');
  });
});

describe('fronteira com o design system continua valendo (lint)', () => {
  it('reporta no-restricted-imports para @jg/design-system/src em qualquer camada', async () => {
    const ids = await ruleIds('@jg/design-system/src/primitives/button', `${SRC}/widgets/hero/x.ts`);

    expect(ids).toContain('no-restricted-imports');
  });
});
