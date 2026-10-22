# C21 RangeSlider: evidencias

Branch `worktree-agent-af37b414ff471b2d0` (ff de `feat/design-system`).

## Fases
1. RED: `RangeSlider.test.tsx` (7 testes) contra esqueleto `return null` (so adicionei `disabled?: boolean` ao tipo para o teste tipar): 7 falhas por asserção (`Cannot find element with locator: getByRole('slider', { name: 'Preço mínimo' })`).
2. GREEN: `RangeSlider` sobre `@radix-ui/react-slider` (2 Thumbs com `aria-label` de `thumbLabels`). 7 passam. Itens 1-4.
   - Erro de premissa MEU no teste "minimo nao ultrapassa maximo": esperei `50-50`, mas o Radix mantem o valor ordenado e passa o foco ao outro thumb ao encostar (`50-70`). A invariante `min <= max` vale; teste ajustado para `lo == 50` e `hi >= 50`.
3. Stories (item 5): Default (`golden`, `golden-focus`), Disabled (`golden`), Keyboard (play: ArrowRight/ArrowLeft por step). `vitest --project storybook range-slider`: 3 passam.
4. Golden (item 6): RED no Docker `A snapshot doesn't exist at .../linux/desktop-1440/primitives-rangeslider--default.png` (9 falhas); GREEN `--update-snapshots=changed` (9 baselines: default, default--focus, disabled x 3 viewports), revisadas visualmente (trilho 4px, faixa primary, thumbs 15px com borda ink, outline de foco no thumb; disabled acinzentado). Reexecucao: `9 passed`.

## Medidas (Figma Slider 70485:360, file.json)
Slider 258x21; Ellipse 15x15 fill primary, stroke ink 3px; linhas 4px primary.

## Verificacao final (reexecutada)
- `pnpm typecheck` e `pnpm lint` (design-system): limpos.
- `pnpm --filter @jg/design-system test`: 52 arquivos / 628 testes passam.

## Lacunas
- Figma pinta o trilho todo em primary (duas linhas 161+55 sem cor de trilho inativo); usei `--color-border` no trilho e primary na faixa selecionada.
- Disabled, hover e foco nao existem no Figma: disabled usa `disabled-text`; foco e o outline global.
- Passo/limites/formatacao de ETH ficam fora do componente (so numeros).
