# C11 Checkbox - evidencias

Branch: `worktree-agent-a134ff199ce452161` (ff de `feat/design-system`). Commits: dad9684 (RED), 8e9800d (GREEN), 14d7e3c (stories), 84a87a8 (golden).

## Figma
- Filtros (70485:381) nao desenham caixa: so texto (14/16 foreground) + contagem "(119)" em text-secondary (estilo 70321:338/fill 70330:305).
- Unico indicador desenhado: "Ellipse 22" 9:1867 (file.json:273758-273905) na linha "Igual a carteira principal" (9:1866): 16x16, stroke 1.5 primary (var 70320:303), sem fill; texto a 8px. "Usar outra carteira?" (11:2862) e so um titulo (file.json:113847), sem caixa.
- Desvios: forma quadrada raio 3 (`--radius-3`) em vez de elipse (diferencia de radio); marcado = fundo primary + check ink 12px (forma, nao so cor); disabled = opacity 50 + not-allowed (sem spec no Figma; `--color-disabled-*` nao usado). Borda 1.5px (Chrome em DPR 1 renderiza 1px; o teste nao mede a largura).

## RED
`pnpm exec vitest run --project unit src/primitives/checkbox` (esqueleto `return null`): `Tests 10 failed | 1 passed (11)`, por `Cannot find element with locator: getByRole('checkbox', ...)`. O unico verde e o axe (DOM vazio, trivial); a cobertura axe real so passa a valer no GREEN.

## GREEN
`Checkbox` sobre `@radix-ui/react-checkbox` (`data-slot="checkbox"`, `size-16 rounded-3 border-[1.5px] border-primary`, `data-[state=checked]:bg-primary`, Indicator com svg `aria-hidden`, foco `focus-visible:outline-2 outline-focus`). Reexecutado: `Tests 11 passed (11)`.
Cobre: 1 role=checkbox + Space; 2 controlado (com e sem atualizacao do pai); 3 medida 16x16/borda/raio; 4 foco 2px primary; 5 glifo de check quando marcado; 6 axe (desmarcado, marcado, disabled, com label).

## Stories e golden
- Stories: Unchecked, Checked, Disabled, WithCount (golden) e Focus (golden-focus). `pnpm exec vitest run --project storybook checkbox`: 5 passed (a11y error ativo).
- RED golden: `pnpm test:visual:docker -g checkbox` falhou 15x com "A snapshot doesn't exist". GREEN: `--update-snapshots=changed`; 2a execucao `15 passed`. Baselines (5 x 3 viewports) revisadas visualmente em desktop-1440: caixa 16px com borda primary, marcado com fundo primary + check escuro, rotulo + "(119)" em tom secundario, foco com anel 2px offset 2, disabled opaco.

## Verificacao final
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 30 arquivos / 487 testes passam (3 execucoes: 2 verdes; 1 com 1 falha em `Button.test.tsx` "primary md" `backgroundColor`, que nao reproduz isolada - flake de carga paralela fora do escopo do C11, a investigar no merge).
