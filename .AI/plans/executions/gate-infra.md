# GATE-INFRA

Branch: `worktree-agent-a3786f6da898ca62f` (fast-forward de `feat/design-system` @49b4f94; o worktree nascera de `main`).

## Parte 1: esqueletos de API
Esqueletos (`return null`, `void props`) + `index.ts` por pasta + `src/index.ts` final (uma linha por componente, ordem alfabetica) para: Label, Input, Textarea, PasswordInput, FormField (`patterns/form-field`), Checkbox, RadioGroup(+Item), ChipGroup(+Item), QuantityStepper, Avatar, Breadcrumb(+Item/Link/Page), Tabs(+List/Trigger/Content), Pagination(+Link), Rating, Select(+Trigger/Value/Content/Item), RangeSlider, Alert, Dialog(+Content/Title/Description/Close), Sheet, NftCard(+Skeleton) (`patterns/nft-card`).
Evidencia: `pnpm -r typecheck` e `pnpm -r lint` limpos.

## Parte 2: golden por tags
- RED (`3e81bbe`): `tests/golden-tags.node.test.ts` contra esqueleto de `golden/stories.ts`: 7 failed | 2 passed, por asserção (`expected [] to deeply equal [...]`).
- GREEN (`0c6c248`): `parseGoldenStories`/`findUnknownGoldenTags`; spec le `storybook-static/index.json`; `manifest.ts` removido: 9 passed.
- Docker (`storybook:build` + `test:visual:docker`): `9 passed` (3 guardas + 3 golden static do Separator), baselines intactas (sem `--update-snapshots`).
- Nota: o spec nao tem nenhuma story com hover/focus/page ainda (ramos nao exercitados no Docker). Tags: `golden`, `golden-hover`, `golden-focus`, `golden-page`.
- `.AI/plans/design-system.md` §3.6/§5 ainda cita `golden/manifest.ts` (fora do escopo de edicao; atualizar).

## Testes finais
- `--project node --project storybook`: 12 files, 134 tests passed.
- `--project unit`: so Badge falha (6 RED proposital); demais 6 arquivos / 29 testes passam. (`--exclude` na CLI nao excluiu o Badge.)
- `pnpm -r typecheck`, `pnpm -r lint`: limpos.
