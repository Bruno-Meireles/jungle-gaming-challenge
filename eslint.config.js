import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

const dsForbiddenImports = [
  { group: ['@jg/web', '@jg/web/*'], message: 'O design system não pode depender do app (@jg/web).' },
  { group: ['@tanstack/*'], message: 'O design system não pode depender de TanStack (Query/Router).' },
  { group: ['axios', 'axios/*'], message: 'O design system não pode depender de Axios.' },
  { group: ['msw', 'msw/*'], message: 'O design system não pode depender de MSW.' },
  { group: ['socket.io-client', 'socket.io-client/*'], message: 'O design system não pode depender de socket.io-client.' },
  // Acesso a slices só via index.ts: 'primitives/x' e 'patterns/x' (nunca 'primitives/x/X').
  { group: ['**/primitives/*/*', '**/patterns/*/*'], message: 'Importe o slice pelo index.ts (ex.: primitives/button), não por arquivos internos.' },
];

// Entre slices irmãos (primitives/* e patterns/*): '../x' pelo index.ts, nunca '../x/X'.
const siblingSliceDeepImport = {
  regex: String.raw`^../[^./][^/]*/[^/]+$`,
  message: 'Importe o slice irmão pelo index.ts (ex.: ../button), não por arquivos internos.',
};

export default tseslint.config(
  { ignores: ['**/dist/**', '**/storybook-static/**', '**/playwright-report/**', '**/test-results/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], plugins: { 'react-hooks': reactHooks }, rules: reactHooks.configs.recommended.rules },
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
          patterns: [
            {
              group: ['@jg/design-system/src', '@jg/design-system/src/*', '@jg/design-system/dist', '@jg/design-system/dist/*'],
              message: 'Importe apenas do entrypoint público @jg/design-system (ou @jg/design-system/styles.css).',
            },
          ],
        },
      ],
    },
  },
);
