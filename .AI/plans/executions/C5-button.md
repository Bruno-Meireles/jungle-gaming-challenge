# C5 Button: evidencias

Branch `worktree-agent-a8d3631b1418f18cf`.

## Fases
1. RED comportamento `9ac796d` / GREEN `7f43c52` (itens 1, 6-10).
2. RED medidas `c693139`: falhas por asserção (ex.: `expected 10 to be 40`, `expected '4px' to be '16px'`, `expected 6 to be 24`). Causa: `--spacing: 1px` (ADR-04), então `h-10` = 10px.
3. GREEN medidas + axe `c54a0b3`: classes em unidades de 1px (`h-40`, `px-40`, `h-45`, `px-16`, `size-24`, `gap-8`, `px-13`). `vitest run src/primitives/button`: 15 passed (inclui axe, item 11).
4. Stories `cd0939d` (item 12): Primary/Outline/Ghost/Icon/Disabled/Loading/AsLink/Keyboard (play Tab). `vitest run --project storybook`: verde; `storybook:build` ok.
5. Golden `0085879` (item 13): tags `golden`, `golden-hover`, `golden-focus`. RED no Docker: `A snapshot doesn't exist at .../primitives-button--primary.png`. 14 baselines por viewport (42 no total) geradas com `--update-snapshots=changed` e revisadas (hover primary-light, foco outline 2px primary offset 2px, disabled bg/texto dos tokens). Reexecução: `42 passed`.

## Verificação final
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- Suíte DS completa: unica falha = `Badge.test.tsx` (6 testes, RED do C3 em outro worktree, fora do escopo; esqueleto herdado).

## Lacunas
- Ícone: Figma não tem container de botão (area 24x24 derivada).
- `loading` sem spinner (nao especificado no Figma).
- I1 (`apps/web/src/app/design-system.smoke.test.tsx`) NAO feito: o plano nao o atribui a C5, exige infra em apps/web (vitest browser, tailwind, `src/`, DS buildado) e arquivos compartilhados; deixado para o integrador apos os merges.
