# C15 Avatar

Branch: `worktree-agent-ad88d4ca5d575ac0a`. Commits: test(red), feat(green), stories, golden (este ciclo).

## Sub-itens (reexecutados)
1 img com alt (src data URI, `getByRole('img', {name})`); 2 sem src e src quebrado -> fallback, sem `<img>`; 3 medida (50x50, raio>=25, bg surface-raised rgb(47,29,21), borda 1px rgb(63,35,25), fallback color primary), rastreada a file.json:243564-243606 no comentario do teste; axe com imagem e com fallback; 4 stories `Image`/`Fallback` (data URI SVG local); 5 golden (tag `golden`).
- RED: `vitest run --project unit src/primitives/avatar` com esqueleto (`return null`): 6 failed, `Cannot find element with locator: getByRole('img', { name: 'Foto de Ana' })` / `getByTestId('fallback-icon')` / `getByTestId('a')` (ausencia do elemento, nao import/setup).
- GREEN: mesmo comando: 1 arquivo, 6 passed.
- Golden RED (`pnpm test:visual:docker`, sem baselines): 6 failed (avatar x 3 viewports), 144 passed. GREEN: `--update-snapshots=changed`: 150 passed; 6 PNG revisados visualmente (Image: circulo laranja com silhueta; Fallback: circulo surface-raised com icone primary).
- `pnpm -r typecheck`, `pnpm -r lint`: sem erros. `pnpm --filter @jg/design-system test`: 38 files, 535 passed.

## Lacunas / notas
- Figma so tem o icone de imagem como instancia de componente remoto (9:1550); o fallback e `ReactNode` do consumidor, a story usa um SVG proprio aproximado.
- Sem imagem carregada o avatar nao tem nome acessivel (o `alt` so vale para a `<img>`); decorativo/consumidor deve rotular se precisar.
- Radix Avatar mostra o fallback enquanto a imagem carrega; a baseline Image capturou a imagem ja carregada.
