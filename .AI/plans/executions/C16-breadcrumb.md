# C16 Breadcrumb: evidencias

Branch `worktree-agent-a1b0a68214e309034` (fast-forward de `feat/design-system`).

## API
`Breadcrumb` renderiza `<nav aria-label="Trilha"><ol>`; filhos = `BreadcrumbItem` (li + separador "/" `aria-hidden`, oculto no ultimo via `group-last/item:hidden`), `BreadcrumbLink` (`<a>` ou `asChild` via Slot), `BreadcrumbPage` (`aria-current="page"`).

## Fases
1. RED comportamento `9dfcfb3` (itens 1-3): 3 falhas `Cannot find element with locator: getByRole('navigation', { name: 'Trilha' })` etc. (esqueleto retorna null). GREEN `af3deb1`: 3 passed.
2. RED medidas `189f6a3` (item 4): `AssertionError: expected '16px' to be '15px'` (2 falhas; fontFamily Roboto Mono ja herdado). GREEN `1457b13`: 5 passed (tokens `text-body-15-bold-lh-16`, `text-foreground`, `gap-8`).
3. Axe `9f18897` (item 5): guarda sem RED (acessibilidade ja satisfeita pela estrutura). 6 passed.
4. Stories + golden (itens 6-7): story `Default` com tags `golden`, `golden-focus`. RED `8651b15`-anterior (commit da story): `A snapshot doesn't exist at .../primitives-breadcrumb--default.png` (6 failed, 144 passed). Baselines geradas no Docker com `--update-snapshots=changed` (6 PNG: 1440/768/390, estatico + foco), revisadas visualmente: Roboto Mono 700, "Início / Mercado / Pagamento", sem "/" apos o ultimo, foco = outline 2px primary no primeiro link. Reexecucao sem update: `150 passed`.

## Medidas (Figma)
Texto 10:290 "Início / Mercado" (file.json:42042; variantes 76356, 107123): Roboto Mono 700, 15px, lineHeight 16 (`--text-body-15-bold-lh-16`), fill #F5F1EB (`--color-foreground`).
Derivados (Figma tem um unico TEXT, sem item ativo/link/separador separados): link e pagina atual com o mesmo estilo; gap 8px ao redor do "/"; hover do link = `--color-text-accent` (sem teste de medida, nao desenhado).

## Verificacao final
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 38 files, 534 tests passed.
- `pnpm storybook:build` ok; `pnpm test:visual:docker`: 150 passed.

## Lacunas
- Item ativo sem estilo distinto (Figma nao desenha); hover do link derivado e sem teste.
- Sem story/golden de hover (derivado).
- Axe cobre apenas a trilha padrao.
