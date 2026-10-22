# C24 Sheet: evidencias

Branch `worktree-agent-a4e6c73b934f9ae88` (ff de `feat/design-system`).

## Fases
1. RED `a1f9ec0`: `Sheet.test.tsx` (8 testes) contra o esqueleto `return null` ja existente: 8 falhas por asserção (`Cannot find element with locator: getByRole('dialog', { name: 'Filtros' })`). `SheetParts.tsx` (re-export de DialogTitle/Description/Close) entrou junto: nao tem comportamento proprio.
2. GREEN `11a2a65`: `Sheet` compoe `Dialog`/`DialogContent` (C23) e so adiciona classes por `side` + keyframes `sheet-in/out-*` em `tokens.css`. 1a execucao: 3 falhas (`expected [0, 390, 972] to equal [0, 390, 844]` etc.): o teste media o retangulo no meio do slide. Edicao justificada do teste: mede apos `getAnimations().finished`. Resultado: 8 passed.
3. Stories + motion `test(stories)`: `Bottom` e `Left` (tag `golden-page`); `golden/motion.spec.ts` ganhou 2 testes do Sheet (apenas `mobile-390`): `no-preference` -> `animation-name` `sheet-in-bottom`; `reduce` -> `none`.
   - Desvio de RED: guarda sem RED proprio (o `base.css` ja nasceu junto do GREEN). Prova por mutacao: removido `[data-slot='sheet-content']` de `base.css`, `storybook:build` e `playwright test motion.spec.ts --project mobile-390`: `Expected: "none" / Received: "sheet-in-bottom"` (1 failed, 2 passed). Restaurado, rebuild: `5 passed` (motion.spec.ts completo).
4. Golden: baselines inexistentes no Docker; `--update-snapshots=changed -g primitives-sheet` gerou 6 (bottom/left x 1440/768/390), revisadas visualmente: bottom ancorado na base, largura total, cantos superiores arredondados, surface-card, titulo/descricao, X primary com foco inicial; left com 320 de largura, altura total, resto da tela escuro.

## Sub-itens
1 foco/role/aria-modal/aria-labelledby/describedby, trap, Esc + devolucao, "Fechar" (herdados do Dialog, provados no Sheet); 2 `side=bottom` ancorado em 390 (left 0, right 390, bottom 844, raio 8); side left/right ancorados (altura total); 3 animacao some com reduced motion (motion.spec.ts, 390); 4 axe aberto; 5 stories Bottom/Left; 6 golden.

## Verificacao final (reexecutada)
- `pnpm -r typecheck` e `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 60 arquivos / 674 testes passam.
- `pnpm test:visual:docker` (apos `pnpm storybook:build`): 260 passed, 7 skipped.

## Lacunas / desvios
- Sem frame no Figma (15:5313 e so o botao): padding 24, raio 8 nos cantos livres, largura 320 (max `100% - 56px`) nas laterais, altura max 85% em baixo, slide 200ms ease-out/in sao derivados.
- Contrato: `Sheet` ja existia como esqueleto `{ side, open, defaultOpen, onOpenChange, children }`; acrescentados `className`, `contentProps` e os exports `SheetTitle/SheetDescription/SheetClose` (aliases do Dialog) e `SheetSide`.
- Overlay/sombra herdados do Dialog (desvios registrados em C23-dialog.md).
- O teste unitario nao alterna `prefers-reduced-motion` (Vitest browser nao permite); a prova esta no Playwright.
