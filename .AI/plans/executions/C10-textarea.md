# C10 Textarea - evidencias

Branch `worktree-agent-a3b77a02bb7fad935` (ff de `feat/design-system`). Commits: 3fd1ed7 (RED), cae7d8a (GREEN), b4ddfff (stories), 900c633 (golden).

- Sub-itens: 1 label + medida, 2 `aria-invalid`, 3 axe, 4 stories, 5 golden.
- RED (reexecutado): `pnpm exec vitest run src/primitives/textarea` contra o esqueleto (`return null`): 6 failed | 1 passed; falhas `Cannot find element with locator: getByRole('textbox', { name: 'Mensagem' })` (ausencia do comportamento). O axe passa com `null` (nada a validar), por isso so conta apos o GREEN.
- GREEN: mesmo comando, 7/7 passam (nome via label htmlFor, aria-invalid, disabled, medidas, placeholder/texto, foco, axe).
- Stories: Default, Placeholder, Filled, Invalid, Disabled (golden) + Focus (golden-focus). `vitest run --project storybook src/primitives/textarea`: 6 passam (a11y `error`).
- Golden: RED no Docker (`node ../../tools/visual-docker.mjs -g textarea`): `A snapshot doesn't exist at .../primitives-textarea--*.png` (18 falhas). GREEN: `--update-snapshots=changed` gera 18 baselines (6 stories x 3 viewports); reexecucao sem update: `18 passed`. Baselines revisadas visualmente (invalid borda vermelha, focus borda primary + outline, disabled fundo marrom, filled com 3 linhas, handle de resize).
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 483 passed, 1 failed: `Button - medidas > primary md` (`rgb(221,154,95)` = primary-light, estado hover por posicao do mouse; flaky, nao relacionado). Reexecutado isolado: `vitest run src/primitives/button` 23/23 passam.
- Lacunas: o Figma NAO tem Textarea (11:2862 e um frame de pagina; "Bio Field" 70386:246 e campo de 417x40, "Description" 70342:2780 e texto). Adotadas as medidas do Email Input 70381:242 (raio 5, padding 16/12, borda 1px input-border, texto 16/16, placeholder 14/16) e `min-h-96` + `resize-y` (decisao do DS, sem fonte no Figma). Chrome: `line-height` do `::placeholder` nao verificado (como no Input). Item 1 "label" coberto por label htmlFor; ligacao automatica label/hint fica no FormField (C8).
