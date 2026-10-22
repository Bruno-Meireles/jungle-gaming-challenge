# C17 Tabs: evidencias

Branch `worktree-agent-a5394d9f73eeb7fa1` (ff de `feat/design-system`).

## Fases
1. RED `ff7ccbf`: `Tabs.test.tsx` (9 testes) contra o esqueleto `return null`: 9 falhas por asserção (`Cannot find element with locator: getByRole('tablist', { name: 'Categorias' })` / `getByRole('tab', ...)`; o axe tem guarda `expect.element(tablist)` para nao passar vacuamente).
2. GREEN `1b790fd`: `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` sobre `@radix-ui/react-tabs` (roving, setas, Home/End do Radix). 8/9 verdes de primeira; 1 falha por premissa MINHA no teste: o Radix chama `onValueChange` no mousedown e de novo no foco (`['novos','novos']`). Teste ajustado para "ao menos uma vez e somente 'novos'" (comentario no teste). Depois 9 passed.
3. Stories (sub-item 5): Default, SecondSelected, ArrowRight (play com `{ArrowRight>}`/`{/ArrowRight}`); `vitest --project storybook src/primitives/tabs`: 3 passed (axe a11y `error` incluso).
4. Golden (sub-item 6): RED no Docker `A snapshot doesn't exist at .../linux/<viewport>/primitives-tabs--default.png` (9 falhas, so Tabs; 162 demais passaram). GREEN com `--update-snapshots=changed`: 9 baselines (default, default--focus, second-selected x 3 viewports), revisadas visualmente (ativa bold text-accent com linha 2px primary; inativas foreground; foco outline 2px primary). Reexecucao sem update: `171 passed`.

## Medidas (Figma Tabs 70395:241 mobile, file.json)
Frame de aba 20 de altura; texto 14/16 (`body-14-bold-lh-16` ativa 700 cor `text-accent` #E89B55; `body-14-regular-lh-16` inativa 400 cor foreground); linha ativa 2px `--color-primary` (Line 3, 15:5366) em y=20 (centrada na borda inferior; implementada como `::after` absoluto, `top-19 h-2`, sem alterar a altura 20); gap entre abas 16 (Frame 234: 143+16+59=218).

## Verificação final (reexecutada)
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 40 arquivos / 553 testes passam.
- `pnpm test:visual:docker`: 171 passed.

## Lacunas
- Variante desktop (Tabs 70351:240): 15/500, ativa so com cor text-accent (sem linha), gap 20 entre textos; nao implementada (so a mobile com sublinhado, que e o que o plano cita). Divergencia entre variantes registrada, sem media.
- Gap entre "Todos os NFTs" e "Novos lançamentos" no mobile e 4 (Frame 408 -> 234) e entre os demais 16: adotado 16 uniforme.
- Hover, disabled e variante vertical nao existem no Figma; disabled usa `disabled-text` por convencao do DS.
- Outline de foco deixa a linha de 2px sobreposta visualmente (o outline abraça o botao de 20px).
