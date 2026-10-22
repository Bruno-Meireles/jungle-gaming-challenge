# C14 QuantityStepper - evidencias

Branch `worktree-agent-a3185419f5acdb5ab` (ff de `feat/design-system`).

## Figma
Grupo "01" 70342:2762 / Frame 48 70410:4189 (file.json:51135): horizontal, gap 12, centralizado. "Add Button" 70410:4190/4194: 33x49.5, raio 33 (`--radius-33`), fill primary, stroke 1 INSIDE ink. Glifos: menos 15.4x2.2, mais 15.4x15.4, ink. Valor 70410:4200: Roboto Mono 20/28 regular, foreground (`text-title-20-regular-lh-10`).
Desvios (sem desenho): hover = primary-hover; active = primary-active; foco = outline 2px focus offset 2px; disabled = `disabled-bg`/`disabled-text` + not-allowed.

## Fases
1. RED `9327543`: `vitest run --project unit src/primitives/quantity-stepper` com esqueleto `return null`: `Tests 16 failed (16)`, por `Cannot find element with locator: getByRole('group', { name: 'Quantidade' })` etc. (ausencia dos elementos). O RED cobre comportamento (itens 1-5) e medidas/estados/axe (6-7) num unico commit (desvio do "um por vez"; todos falhavam pelo motivo certo).
2. GREEN: `Tests 16 passed (16)`. Grupo `role=group aria-label`, botoes com `disabled` em min/max, `<output aria-live=polite>`.
3. Stories (item 8): Default (golden, golden-hover, golden-focus), AtMin, AtMax (golden), Increment (play). `vitest run --project storybook quantity`: `4 passed`.
4. Golden (item 9): RED `pnpm test:visual:docker -g quantity` -> "A snapshot doesn't exist" (15 falhas). GREEN `--update-snapshots=changed`; reexecucao `15 passed`. Revisadas visualmente em desktop-1440 (foco: anel 2px offset 2 no Diminuir; AtMin: Diminuir com fundo/glifo disabled, mais primary).

## Verificacao final
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 3 execucoes; todas com 1 falha em outro componente: `PasswordInput.test.tsx` "Mostrar senha" (timeout de click 15s) e, numa, timeout de conexao do browser storybook. `vitest run --project unit src/primitives/password-input` isolado: 8 passed. Flake de carga paralela fora do C14 (mesmo padrao do Button no C11).
- Testes do C14: 16/16 unit + 4/4 storybook em todas as execucoes.

## Lacunas
- Hover/disabled/foco sem desenho no Figma (desvios acima). Valor inteiro; sem entrada digitada.
- `storybook-static/` precisou ser construido (`pnpm storybook:build`) antes do golden; nao versionado.
