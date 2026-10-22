# C18 Pagination: evidencias

Branch `worktree-agent-a500f6628cd3f3d41` (ff de `feat/design-system`).

## Fases
1. RED `84ef618` (itens 1-5): `vitest run --project unit src/primitives/pagination`: 12 failed | 1 passed. Falhas por asserção/ausência de comportamento (`Cannot find element with locator: getByRole('link', { name: '1' })`, esqueleto devolve null). O unico verde era o axe (vacuo com render nulo; passa de verdade no GREEN).
2. GREEN `933259a`: `Pagination` (`<nav aria-label="Paginação">`, `<ul>`, um `PaginationLink` por pagina, `aria-current="page"` na atual, "Próxima" = chevron + `aria-label`, href vindo de `getItemProps(page+1)`; na ultima pagina `role="link" aria-disabled="true"` sem href) e `PaginationLink` (`asChild` via Slot, `data-slot="pagination-link"`). 13 passed.
   - Correcao no GREEN (edicao de teste justificada): o teste 4 buscava a "Próxima" desabilitada por `getByLabelText`; axe falhou com `aria-prohibited-attr` (um `<a>` sem href tem papel generico e nao aceita aria-label). Solucao: `role="link"` + `aria-disabled`, teste passou a localizar por `getByRole('link', { name: 'Próxima' })` e a checar que nao recebe foco por Tab.
3. Stories `feat: stories` (item 6): First/Middle/Last (+ Keyboard com play). `vitest run --project storybook pagination`: 4 passed; `storybook:build` ok.
4. Golden (item 7): tags `golden` (First/Middle/Last) e `golden-focus` (First). RED no Docker: `A snapshot doesn't exist at .../primitives-pagination--first.png` (12 falhas). Baselines geradas com `--update-snapshots=changed` (12 PNG: 4 por viewport) e revisadas visualmente (item atual primary com texto ink, demais com borda border, chevron, foco outline 2px primary offset 2px, ultima pagina com seta em disabled-text). Reexecucao `pnpm --filter @jg/design-system test:visual:docker -g primitives-pagination`: `12 passed`.

## Medidas (Figma 70342:2825, frame 207x35, gap 8)
Item 35x35, raio 4 (`--radius-4`); atual fundo `--color-primary`, texto `--color-ink` 18/16 peso 700; demais borda 1px `--color-border`, texto `--color-foreground` 18/16 peso 400; seta 18x18.

## Verificacao final
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 44 files, 579 tests passed.

## Lacunas
- Hover do item e "Anterior" nao existem no Figma (so "Próxima"); nao implementados. Sem reticencias: renderiza todas as paginas (o contrato nao define janela).
- Estado desabilitado da seta (cor `--color-disabled-text`) e derivado.
- Icone chevron desenhado a mao (nao exportado do Iconly).
