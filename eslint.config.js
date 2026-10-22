import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

const dsForbiddenImports = [
  { group: ['@jg/web', '@jg/web/*'], message: 'O design system não pode depender do app (@jg/web).' },
  { group: ['@tanstack/*'], message: 'O design system não pode depender de TanStack (Query/Router).' },
  { group: ['axios', 'axios/*'], message: 'O design system não pode depender de Axios.' },
  { group: ['msw', 'msw/*'], message: 'O design system não pode depender de MSW.' },
  { group: ['socket.io-client', 'socket.io-client/*'], message: 'O design system não pode depender de socket.io-client.' },
  {
    group: ['i18next', 'i18next/*', 'react-i18next', 'react-i18next/*', 'react-intl', 'react-intl/*', 'use-intl', 'use-intl/*', 'next-intl', 'next-intl/*', 'typesafe-i18n', 'typesafe-i18n/*', '@formatjs/*', '@lingui/*'],
    message: 'O design system é agnóstico de idioma: não pode depender de lib de i18n (textos entram por props).',
  },
  // Acesso a slices só via index.ts: 'primitives/x' e 'patterns/x' (nunca 'primitives/x/X').
  { group: ['**/primitives/*/*', '**/patterns/*/*'], message: 'Importe o slice pelo index.ts (ex.: primitives/button), não por arquivos internos.' },
];

// Entre slices irmãos (primitives/* e patterns/*): '../x' pelo index.ts, nunca '../x/X'.
const siblingSliceDeepImport = {
  regex: String.raw`^../[^./][^/]*/[^/]+$`,
  message: 'Importe o slice irmão pelo index.ts (ex.: ../button), não por arquivos internos.',
};

// ---- apps/web: FSD (ADR-21), só com regras do núcleo ----
// no-restricted-imports não faz merge entre blocos `files`: cada bloco repete todos os padrões que lhe cabem.
const WEB_SRC = 'apps/web/src';
const WEB_EXT = '{ts,tsx}';
const WEB_LAYERS = ['shared', 'entities', 'features', 'widgets', 'pages', 'app'];
const MAX_DEPTH = 5;

const webDsEntrypointOnly = {
  group: ['@jg/design-system/src', '@jg/design-system/src/*', '@jg/design-system/dist', '@jg/design-system/dist/*'],
  message: 'Importe apenas do entrypoint público @jg/design-system (ou @jg/design-system/styles.css).',
};

const webMocksOnlyInBootstrap = {
  regex: String.raw`(^|/)mocks(/|$)`,
  message: 'A camada de mocks só pode ser importada por app/bootstrap.',
};

const webFrameworkFree = {
  group: [
    'react',
    'react/*',
    'axios',
    'axios/*',
    '@tanstack/*',
    'msw',
    'msw/*',
    'i18next',
    'i18next/*',
    'react-i18next',
    'react-i18next/*',
  ],
  message: 'Domínio e shared/lib não podem depender de React, Axios, TanStack, MSW ou i18next.',
};

const webTestFiles = ['**/*.{test,spec}.{ts,tsx}', '**/tests/**'];

function webLayerPatterns(layer, depth) {
  const index = WEB_LAYERS.indexOf(layer);
  const upper = WEB_LAYERS.slice(index + 1);
  const lowerSlices = WEB_LAYERS.slice(1, index); // shared tem segmentos; deep import só vale para slices
  const patterns = [webDsEntrypointOnly];
  if (upper.length > 0) {
    patterns.push({
      regex: String.raw`^(\.\./)+(${upper.join('|')})(/|$)`,
      message: `A camada ${layer} não pode importar de camadas superiores (${upper.join(', ')}).`,
    });
  }
  if (lowerSlices.length > 0) {
    patterns.push({
      regex: String.raw`^(\.\./)+(${lowerSlices.join('|')})/[^/]+/`,
      message: 'Acesse o slice pelo index.ts (ex.: entities/nft), não por arquivos internos.',
    });
  }
  if (layer !== 'shared' && layer !== 'app') {
    patterns.push(
      {
        regex: String.raw`^(\.\./)+${layer}(/|$)`,
        message: 'Slices da mesma camada não podem importar entre si.',
      },
      {
        regex: String.raw`^(\.\./){${depth + 1}}[^./]`,
        message: 'Slices da mesma camada não podem importar entre si.',
      },
    );
  }
  return patterns;
}

function webBlock(files, patterns) {
  return {
    files,
    ignores: webTestFiles,
    rules: { 'no-restricted-imports': ['error', { patterns }] },
  };
}

const webLayerBlocks = WEB_LAYERS.flatMap((layer) => {
  if (layer === 'shared' || layer === 'app') {
    return [webBlock([`${WEB_SRC}/${layer}/**/*.${WEB_EXT}`], [...webLayerPatterns(layer, 0), webMocksOnlyInBootstrap])];
  }
  return Array.from({ length: MAX_DEPTH + 1 }, (_, depth) =>
    webBlock(
      [`${WEB_SRC}/${layer}/*/${'*/'.repeat(depth)}*.${WEB_EXT}`],
      [...webLayerPatterns(layer, depth), webMocksOnlyInBootstrap],
    ),
  );
});

// Declarados depois dos blocos de camada para vencerem nos arquivos sobrepostos.
const webDomainBlocks = [
  webBlock(
    [`${WEB_SRC}/shared/lib/**/*.${WEB_EXT}`],
    [...webLayerPatterns('shared', 0), webMocksOnlyInBootstrap, webFrameworkFree],
  ),
  ...WEB_LAYERS.filter((layer) => layer !== 'shared' && layer !== 'app').flatMap((layer) =>
    Array.from({ length: 4 }, (_, extra) =>
      webBlock(
        [`${WEB_SRC}/${layer}/*/model/domain/${'*/'.repeat(extra)}*.${WEB_EXT}`],
        [...webLayerPatterns(layer, 2 + extra), webMocksOnlyInBootstrap, webFrameworkFree],
      ),
    ),
  ),
];

const webBootstrapBlock = webBlock([`${WEB_SRC}/app/bootstrap/**/*.${WEB_EXT}`], webLayerPatterns('app', 0));

// ---- apps/web: textos hardcoded em JSX (i18n, ADR-21) ----
// no-restricted-syntax não faz merge entre blocos `files`: este bloco não alcança arquivos de teste
// (ignores), que mantêm o bloco de testes (.only/.skip) declarado logo depois.
const I18N_ATTRS = '/^(aria-label|aria-description|alt|title|placeholder|label)$/';
const webI18nBlock = {
  files: [`${WEB_SRC}/**/*.tsx`],
  ignores: ['**/*.test.{ts,tsx}', 'apps/web/e2e/**', `${WEB_SRC}/mocks/**`],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXText[value=/\\p{L}/u]',
        message: 'Texto hardcoded em JSX: use uma chave de i18n (t(...)).',
      },
      {
        selector: `JSXAttribute[name.name=${I18N_ATTRS}] > Literal[value=/\\p{L}/u]`,
        message: 'Texto hardcoded em atributo acessível/visível: use uma chave de i18n (t(...)).',
      },
      {
        selector: `JSXAttribute[name.name=${I18N_ATTRS}] > JSXExpressionContainer > Literal[value=/\\p{L}/u]`,
        message: 'Texto hardcoded em atributo acessível/visível: use uma chave de i18n (t(...)).',
      },
      {
        selector: 'JSXExpressionContainer > TemplateLiteral',
        message: 'Template literal em JSX: monte o texto por chave de i18n com interpolação (t(...)).',
      },
    ],
  },
};

export default tseslint.config(
  { ignores: ['**/dist/**', '**/storybook-static/**', '**/playwright-report/**', '**/test-results/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], plugins: { 'react-hooks': reactHooks }, rules: reactHooks.configs.recommended.rules },
  webI18nBlock,
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/tests/**/*.{ts,tsx}', '**/golden/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        ...['it', 'test', 'describe'].flatMap((object) =>
          ['only', 'skip', 'fixme'].map((property) => ({
            object,
            property,
            message: `Não commite testes com ${object}.${property}.`,
          })),
        ),
      ],
      // Playwright: test.describe.skip/only/fixme (callee aninhado, fora do alcance de no-restricted-properties).
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.object.name=/^(test|it)$/][callee.object.property.name='describe'][callee.property.name=/^(only|skip|fixme)$/]",
          message: 'Não commite test.describe.only/skip/fixme.',
        },
      ],
    },
  },
  {
    files: ['packages/design-system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: dsForbiddenImports,
        },
      ],
    },
  },
  {
    files: ['packages/design-system/src/primitives/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...dsForbiddenImports,
            siblingSliceDeepImport,
            {
              group: ['**/patterns', '**/patterns/*'],
              message: 'Primitives não podem importar de patterns (dependência só de patterns para primitives).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/design-system/src/patterns/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...dsForbiddenImports, siblingSliceDeepImport] }],
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [webDsEntrypointOnly],
        },
      ],
    },
  },
  ...webLayerBlocks,
  ...webDomainBlocks,
  webBootstrapBlock,
);
