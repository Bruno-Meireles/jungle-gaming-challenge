# GATE-TOKENS: evidencias

Branch `worktree-agent-a57f91284dec10447`, base `f575531` (fundacao do DS, sem o RED do Badge). Testes derivados do `docs/figma/file.json`.

## Contagens finais (tokens.css)

| Grupo | Antes | Depois |
|---|---|---|
| Cores Figma | 29 | 29 |
| Aliases semanticos | 5 | 14 (+9) |
| Tipografia (`--text-*` base) | 1 | 59 (x4 propriedades) |
| Raios | 2 | 29 |
| Sombras | 0 | 7 |
| Breakpoints | 0 | 2 (+ reset) |

Suite final: `pnpm --filter @jg/design-system test` = 17 arquivos, 400 testes verdes; `pnpm -r typecheck` e `pnpm -r lint` limpos.

## RED/GREEN por grupo

1. Tipografia: RED `b6f8c04` (117 falhas por asserção: `expected { size: undefined, ...}` e `expected ['--text-body-14-bold-lh-16'] to deeply equal [... 59]`). GREEN `584e618` (230 verdes no arquivo). Estilos sem uso em nos (5) usam a `description` "combo:..."; "lh auto" = `normal`. Slugs: `Body/14 Medium · lh 16 · ls 0%` = `--text-body-14-medium-lh-16-ls-0`; teste de colisao incluido.
2. Raios: RED `d60f811` (28 falhas: `expected { value: undefined, ... }` e inventario `['--radius-3','--radius-5']` vs 29). GREEN `8646c2d`. 29 raios uniformes; 5 cantos assimetricos como Lacuna (teste lista exatamente essas 5).
3. Sombras: RED `d0c448c` (9 falhas por asserção). GREEN `6c9bcb0`. Nome `--shadow-x<X>-y<Y>-b<blur>[-s<spread>]-a<alfa%>-<hex6>` (n=negativo, p=ponto).
4. Semanticos + contraste: RED `93ecad5` (24 falhas; as de contraste falham pela excecao do helper "token --color-X nao declarado", isto e, token ausente, nao import/ENOENT). GREEN `999d1c9`.
5. Breakpoints + compile: RED `489f200` (5 falhas). GREEN `54a9e67`. Os testes de compile `rounded-/shadow-/text-` ja passaram no RED porque os tokens existiam (guarda, sem RED proprio).

## Desvios e decisoes

- O worktree nascia do commit inicial (sem `packages/`); foi avancado por fast-forward para `f575531` (feat/design-system sem o RED do Badge, que deixaria a suite vermelha).
- Testes existentes generalizados (T12/T13): `findNode` agora so aceita objetos com `type` (o id `I70492:696;70491:1237` aparece duplicado em um objeto que nao e no); raios/sombras arredondados a 2 casas (`2.1180124282836914` = `2.12px`; `6.599999904` = `6.6px`); o figma: de um raio pode ser qualquer no que o use (3 e 5 mantem `70386:262` e `70381:242`); o teste de sombra compara um efeito do no (nao a lista inteira) e inclui spread/inset.
- `--color-surface-raised` ja era cor Figma (70323:313) e `--color-success` tambem: nao duplicados.
- `--color-overlay`: Lacuna (nenhum fill translucido em todo o file.json). `--color-link` = `text-accent` (Forgot Link 70381:244, 70399:242); Signup/Login Link usam Text/Secondary.
- Contraste: ink sobre primary 6.85, primary-hover 8.12, primary-active 5.72; text-muted x bg 9.53; accent x bg 6.85; disabled-text x disabled-bg **3.94:1** (< 4.5; isento de WCAG 1.4.3; testado >= 3.0).
- `--breakpoint-*` nao e reconhecido pelo `parseDeclarations` (regex sem `*`): reset conferido no CSS cru.
- Lacunas: Text/Primary (Q11), 5 cantos assimetricos (`0,3,3,0`; `0,6,6,0`; `14,0,0,14`; `31,31,0,0`; `40,40,0,0`), `--color-overlay`. Strokes distintos: 0.22, 0.3, 1, 1.2, 1.3, 1.5, 2, 3, 4, 4.24 px (ver `docs/design-tokens.md`).
