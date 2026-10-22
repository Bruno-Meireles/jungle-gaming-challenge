# C23 Dialog: evidencias

Branch `worktree-agent-aff691da61427b540` (ff de `feat/design-system`).

## Fases
1. RED `c252eba`: `Dialog.test.tsx` (13 testes) contra o esqueleto `return null`: 13 falhas por asserção (`Cannot find element with locator: getByRole('dialog', { name: 'Entrar' })`; ARIA tree so com o botao "Abrir entrada"). O axe tem guarda `expect.element(dialog)`.
2. GREEN `e9d58a8`: `Dialog`/`DialogContent`/`DialogTitle`/`DialogDescription`/`DialogClose` sobre `@radix-ui/react-dialog`. Duas falhas na 1a rodada:
   - Teste meu: `getByRole('button', {name:'Abrir entrada'})` nao acha o botao de fundo (Radix o deixa `aria-hidden`); trocado por `getByText`.
   - Achado real: o Radix so devolve o foco com `Dialog.Trigger`; o Dialog do DS e controlado (sem trigger), entao o foco ia para o body. `DialogPanel` (montado so quando aberto, dentro do Portal) guarda `document.activeElement` na abertura e o refoca em `onCloseAutoFocus` (respeita `preventDefault` do consumidor). Primeira tentativa guardava no `DialogContent` e capturava o body (Root renderiza os filhos mesmo fechado); movido para dentro do Portal.
   - `aria-modal="true"` nao vem do Radix: adicionado no Content.
   Resultado: 13 passed.
3. Stories `test(stories)`: `Open` (tag `golden-page`, aberta por padrao) e `EscReturnsFocus` (play: abre, Esc, foco volta ao botao); `vitest --project storybook src/primitives/dialog`: 2 passed (axe a11y `error` incluso).
4. Golden: RED no Docker `A snapshot doesn't exist at .../linux/<viewport>/primitives-dialog--open--page.png` (3 falhas). GREEN com `--update-snapshots=changed -g primitives-dialog`: 3 baselines (1440/768/390) revisadas visualmente (painel centralizado surface-card raio 8, titulo e descricao, X primary com outline de foco 2px por foco inicial no botao fechar; em 390 painel com margem de 16 e texto quebrando). Reexecucao completa sem update: `225 passed, 3 skipped`.

## Sub-itens
1 foco entra/role/aria-modal/aria-labelledby/describedby; 2 trap Tab/Shift+Tab; 3 Esc + devolucao de foco; 4 "Fechar" (e `closeLabel`); 5 medidas; 6 sem overflow em 390 (`page.viewport(390, 844)`, restaurado no afterEach); 7 axe aberto (`document.body`); 8 stories; 9 golden.

## Medidas (Figma Sign Up Modal 70383:239 / Sign In 70381:239, file.json)
Painel 500 de largura, fill surface-card (variavel 70320:314 = #241612), raio 8 (Sign Up; Sign In sem raio informado), sem sombra. Header: padding topo/lados 48; titulo 20/500 foreground (`text-title-20-medium`), descricao 13/400 lh16 foreground (`text-caption-13-regular-lh-16`). X (9:947): 18x18, vetor 12x12 a 3px da borda, cor primary; posicao 12 da direita e 11 do topo do painel.

## Verificação final (reexecutada)
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 52 arquivos / 633 testes passam.
- `pnpm test:visual:docker` (apos `pnpm storybook:build`): 225 passed, 3 skipped.

## Lacunas / desvios
- Overlay: o Figma nao tem fill translucido (docs/design-tokens.md:185, `--color-overlay` sem token). Usado `rgba(10,6,4,0.45)` (cor-base das sombras do DS) como classe arbitraria no componente; promover a token quando o usuario decidir.
- Sombra: o modal do Figma nao tem efeitos; aplicado `--shadow-x0-y0-b40-a45-0a0604` (token existente, nó 16:858) por convencao de elevacao. Desvio.
- Padding do painel 48 e uniforme (Figma: header 48 topo/lados; corpo varia por modal e fica com o consumidor via `className`).
- Responsivo: Figma so mostra desktop 500; em telas estreitas largura `min(500, 100% - 32)` e altura max `100% - 32` com scroll interno (decisao minha).
- Sem `DialogTrigger` no contrato (plano); o foco volta ao elemento ativo na abertura.
- Animacao de entrada/saida nao existe no Figma: nao implementada.
