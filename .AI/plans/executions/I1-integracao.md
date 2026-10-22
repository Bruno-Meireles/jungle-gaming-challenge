# I1 Integracao app + design system

Branch: `worktree-agent-aa76213bee3f1e3e8` (a partir de `feat/design-system`, ff-only). Commits: `c9cd3e8` build do DS, `c3c3a9a` test(red), `c35a6df` feat(green), docs (este).

## Achados de pre-condicao
- O script `build` do DS (`tsc -p tsconfig.build.json && node scripts/copy-assets.mjs`) apontava para arquivos inexistentes (ADR-03 previsto, nunca criado). Criados `packages/design-system/tsconfig.build.json` (ESM + `.d.ts`, exclui testes/stories/`src/test`) e `scripts/copy-assets.mjs` (copia `src/styles` sem testes e `src/fonts` para `dist`). `pnpm --filter @jg/design-system build` gera `dist/` (index.js/.d.ts, styles/*.css, fonts/*.woff2); `dist/` segue no `.gitignore`. Turbo ja tem `test`/`typecheck` com `dependsOn: ["^build"]`.
- App ganhou projeto vitest `unit` (browser chromium, 1440x900, plugin Tailwind) e `vite/client` nos types do tsconfig.

## RED (por asserção)
`pnpm test` em apps/web com `styles.css` do app (`@import "tailwindcss"; @import "@jg/design-system/styles.css"`) e CSS do DS sem `@source`:
`AssertionError: expected 'rgba(0, 0, 0, 0)' to be 'rgb(210, 138, 76)'` (1 failed, 5 passed). Import via `exports` resolveu (sem erro de modulo); so as utilities do dist nao foram geradas.

## GREEN
`@source "../";` em `packages/design-system/src/styles/index.css` (em `dist/styles` aponta para `dist/`). Apos `build` do DS: `pnpm test` em apps/web: 3 arquivos, 6 passed (background rgb(210,138,76) e font-family contendo "Roboto Mono").

## Reexecucao final
- `pnpm -r typecheck`: sem erros. `pnpm -r lint`: sem erros.
- `pnpm -r test`: DS 60 arquivos / 680 passed; web 3 arquivos / 6 passed.

## Provado
- `@import "@jg/design-system/styles.css"` resolve por `exports` -> `dist/styles/index.css` (e as `url()` de fontes relativas dentro de dist).
- `@source "../"` do dist faz o Tailwind do app gerar `bg-primary` etc.

## Lacunas / notas
- O teste de fonte so verifica a declaracao computada (`font-family`), nao que o woff2 carregou; carregamento coberto por `fonts.test.tsx` no DS.
- `pnpm test` do app isolado exige `dist` ja construido; via `turbo`/`pnpm -r test` o build precede (confirmado: `pnpm -r test` fora do turbo usou dist previamente construido manualmente).
- Nao foi editado `.AI/plans/design-system.md` (marcar I1 `[x]` fica com o chamador).
