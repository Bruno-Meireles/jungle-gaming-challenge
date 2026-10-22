# C19 Rating

Branch: `worktree-agent-afcb3caf59e125fb9`. Commits: test(red), feat(green) (inclui stories), test(golden), docs (este).

## Sub-itens (reexecutados)
1 `role=img` unico com nome = prop `label`, 5 `<svg aria-hidden>`; `value` arredondado e limitado a 0..5. 2 medida (Frame 40 11:1210, instancias Star 11:1192): 15x15 por estrela, gap 4 (passo 19 no Figma), total 91x15, cheia `--color-primary` rgb(210,138,76), vazia `--color-text-secondary` rgb(207,178,140) (5a estrela 11:1207); path do vetor = `fillGeometry` de I11:1195;11:1194 (12.5x11.88, offset 1.25/1.5625 na instancia). axe sem violacoes. 3 stories `Default`/`Full`/`Empty`. 4 golden (tag `golden` em Default e Full).
- Esqueleto: `Rating` ganhou `ComponentProps<'div'>` (para `data-testid`/className).
- RED: `vitest run --project unit src/primitives/rating` com esqueleto: 6 failed, `Cannot find element with locator: getByRole('img', { name: ... })` / `getByTestId('r')`.
- GREEN: mesmo comando: 1 arquivo, 6 passed.
- Golden RED (`pnpm test:visual:docker -g primitives-rating`, sem baselines): 6 failed, `A snapshot doesn't exist at .../primitives-rating--default.png`. GREEN: `--update-snapshots=changed`: 6 passed; reexecucao: 6 passed; 6 PNG revisados (4 estrelas laranja + 1 bege; 5 laranja; sobre surface-card).
- `pnpm -r typecheck`, `pnpm -r lint`: sem erros. `pnpm --filter @jg/design-system test`: 52 arquivos, 627 passed.

## Lacunas / notas
- Estrela e remota (componente 11:1192): path copiado do `fillGeometry` das instancias. Nao ha estado de meia estrela no Figma; fracao arredonda.
- `-g` do golden usa o id com hifen (`primitives-rating`); sem hifen nao encontra testes.
- Stories foram commitadas junto do commit green (um `git add -A`), nao em commit separado.
- O texto "19 avaliacoes" do card fica fora do componente (NftCard).
