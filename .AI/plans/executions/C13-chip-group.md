# C13 ChipGroup - evidencias

Branch: `worktree-agent-aaa223f075bc3d251` (ff de `feat/design-system`). Commits: 451038a (RED), 5198d93 (GREEN), stories, golden (ver `git log`).

## Figma (Lacuna)
"Edicoes" (11:2024, file.json:76842) e "Edicao: 1/50" (22:1316) existem so como TEXTO; nenhum chip desenhado. Medida DERIVADA, nao do Figma: h-40 (Button/Input), `rounded-3`, px-16, borda 1px `secondary`, 14/16 regular foreground; selecionado = fundo/borda primary, texto ink, bold 700 (estado nao so por cor); disabled = opacity 50 + not-allowed; foco outline 2px focus offset 2.

## RED
`pnpm exec vitest run --project unit src/primitives/chip-group` (esqueleto null): `Tests 9 failed (9)`, por `Cannot find element with locator: getByRole('radiogroup'/'radio')`.

## GREEN
`ChipGroup`/`ChipGroupItem` sobre `@radix-ui/react-radio-group` (roving, setas, pula disabled). Reexecutado: `Tests 9 passed (9)`. Ajuste no teste de disabled: foco explicito no 1o chip apos o clique forcado (Tab nao reentra apos clicar em item desabilitado).
Cobre: 1 radiogroup+setas+Tab; 2 disabled anunciado/nao selecionavel/pulado; 3 medida normal/selecionado; 4 axe; foco; cursor/opacity.

## Stories e golden
Stories Default, SecondSelected, WithDisabled (golden), Focus (golden-focus). `vitest --project storybook chip-group`: 4 passed.
RED golden: `pnpm test:visual:docker -g chipgroup` 12 failed ("A snapshot doesn't exist"). GREEN: `--update-snapshots=changed`; 2a execucao `12 passed`. Baselines (4 x 3 viewports) revisadas visualmente (desktop-1440 with-disabled e focus).

## Verificacao final
`pnpm -r typecheck`, `pnpm -r lint` limpos; `pnpm --filter @jg/design-system test`: 38 arquivos / 540 testes passam.
