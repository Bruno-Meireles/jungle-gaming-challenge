# C12 RadioGroup: evidencias

Branch `worktree-agent-a1da6680ee6133264` (ff de `feat/design-system`).

## Fases
1. RED `a892c81`: `RadioGroup.test.tsx` (9 testes) contra esqueleto `return null`: 8 falhas por asserção (`Cannot find element with locator: getByRole('radiogroup', { name: 'Carteira' })` / `getByRole('radio', ...)`); o axe passa vacuamente com `null` (guarda).
2. GREEN `57669ac`: `RadioGroup`/`RadioGroupItem` sobre `@radix-ui/react-radio-group` (roving e setas do Radix). Itens 1-5.
3. Ajustes de teste `GREEN` (commit seguinte): dois erros de premissa MEUS no teste, nao do componente: `rounded-full` computa `3.35544e+07px` (nao `9999px`) e o Chrome arredonda borda 1.2px para `1px` (dpr 1). Asserções passaram a `raio >= 8` e `1px` (Figma 1.2px registrado em comentario).
4. Stories (item 6): Default/Card/CardSelected/Disabled/ArrowKeys (play). Achado: com `userEvent.keyboard('{ArrowDown}')` (keydown+keyup sincronos) o Radix move o foco mas nao marca (a marcacao ocorre num rAF depois do keyup); o play usa `{ArrowDown>}` ... `{/ArrowDown}`. No teste unit (teclado real) `{ArrowDown}` funciona.
5. Golden (item 7) `test(golden)`: RED no Docker `A snapshot doesn't exist at .../linux/desktop-1440/primitives-radiogroup--default.png` (18 falhas); GREEN com `--update-snapshots=changed`: 18 baselines (6 por viewport: default, default--focus, card, card-selected, card-selected--focus, disabled), revisadas visualmente (foco outline 2px primary offset 2; selecionado borda primary + miolo; disabled bg disabled-bg). Reexecução: `108 passed`.

## Medidas (Figma 11:2862, file.json; frame de carteira 70522:3321;70504:3172)
Circulo 16x16 stroke primary 1.2px, miolo 10x10 primary; card 405x45, raio 3, borda 1px `--color-border`, px 12, gap 10; selecionado borda primary, px 16, gap 12; gap entre itens 16.

## Verificação final (reexecutada)
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 30 arquivos / 485 testes passam.

## Lacunas
- O Figma só mostra o card com texto (nenhum radio "default" isolado com label); variante default medida só pelo círculo.
- Estado disabled nao existe no Figma: usa tokens `disabled-bg`/`disabled-text` (mesma convenção do Input).
- Hover nao especificado (sem `golden-hover`).
