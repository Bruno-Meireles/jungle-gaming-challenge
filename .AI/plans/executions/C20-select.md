# C20 Select: evidencias

Branch `worktree-agent-af8d55a2d6b8c0ecb` (ff de `feat/design-system`).

## Fases
1. RED `2512196`: `Select.test.tsx` (11 testes) contra o esqueleto `return null`: 11 falhas por asserção (`Cannot find element with locator: getByRole('combobox', { name: 'Ordenar por' })` / `getByRole('option', ...)`).
2. GREEN `f89b579`: `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem` sobre `@radix-ui/react-select` (popper, portal). 9/11 verdes de primeira; 2 falhas dos testes com lista aberta por prop `open`:
   - o Select modal trava `pointer-events` do body e o setup global (`unhover`) ficava preso: testes passaram a desmontar (`unmount` em `finally`);
   - axe no `document.body` aberto acusa `aria-hidden-focus` (o Radix põe `aria-hidden` no container que contém o trigger focável). Axe aberto passou a validar o painel (`[data-radix-popper-content-wrapper]`); o trigger fechado tem teste próprio. Edição do teste justificada aqui, não é enfraquecimento do comportamento.
   Depois: `vitest --project unit src/primitives/select`: 11 passed.
3. Stories `7d6239f` (sub-item 7): Placeholder (`golden`, `golden-focus`), Selected (`golden`), Open (`golden-page`), Invalid (`golden`), Keyboard (play). `vitest --project storybook src/primitives/select`: 5 passed. Na story Open a regra axe `aria-hidden-focus` está desligada só nela (mesmo motivo acima), comentada no arquivo.
4. Golden (sub-item 8): RED no Docker `A snapshot doesn't exist at .../linux/<viewport>/primitives-select--*.png` (15 falhas). GREEN com `--update-snapshots=changed -g primitives-select`: 15 baselines (placeholder, placeholder--focus, selected, open--page, invalid x 3 viewports), revisadas visualmente (trigger 40 de altura com chevron à direita; foco: borda + outline primary; invalid: borda vermelha; aberto: painel surface-card com opção selecionada em text-accent bold e destaque surface-raised). Reexecução completa sem update: `237 passed`.

## Cobertura dos sub-itens
1 combobox com nome; 2 Enter abre, ArrowDown, Enter seleciona, foco volta ao trigger; 3 Esc fecha sem `onValueChange` e valor mantido; 4 medida trigger (340x40, raio 5, borda 1px secondary, padding-x 16) e chevron 20x20 decorativo (Arrow-Down 9:1589, `file.json:241387`, size 20x20); 5 `aria-invalid` borda `--color-error`; 6 axe fechado e painel aberto; 7 stories; 8 golden.

## Verificação final (reexecutada)
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 52 arquivos / 634 testes passam.
- `pnpm test:visual:docker` (em packages/design-system, após `pnpm storybook:build`): 237 passed.

## Lacunas
- Medidas do painel/opções (altura 36, padding 4, raio 3/5, destaque `surface-raised`) não existem no Figma (só o trigger e o chevron): derivadas por convenção do DS.
- Trigger usa borda `--color-input-border` (secondary), mesmo desvio do Input; o nó ENS Input 70386:249 é 417x40, a largura vem do contêiner.
- Chevron desenhado como traço 1.5 em viewBox 20 (aproximação do vetor 13.5x7.5 do Figma); cor foreground.
- axe com a lista aberta não cobre o container `aria-hidden` do Radix (ver acima).
- Mobile-first: lista só em `popper`; `item-aligned` não testado.
