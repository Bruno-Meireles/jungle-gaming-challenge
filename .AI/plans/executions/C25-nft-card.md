# C25 NftCard + NftCardSkeleton

Branch: `worktree-agent-a5364f8681d5c2741` (ff de `feat/design-system`). Commits por fase: `4176d1d` test(red) comportamento; `4e9d35e` feat(green); `14ff150` test(red) medidas; `4517887` feat(green); `9f7c829` test(red) skeleton; `e8730ee` feat(green); `a236c67` axe + guarda priceLabel; `ded3379` stories; `8ea349c` test(red) foco; `2868a6c` feat(green) foco; `e14ab37` golden.

## Sub-itens (reexecutados)
1 titulo como link (`link` clonado com o titulo, `<a>` unico; `::after` estica sobre o card, sem link aninhado; clique na imagem aciona o link; foco desenhado no `::after` do card inteiro). 2 `image.alt` obrigatorio no tipo (`@ts-expect-error`) e renderizado. 3 `priceLabel` literal (`0.1000000000000000001 ETH`, `1.50 ETH`, texto nao numerico passam intactos; `tests/nft-card-price.node.test.ts` proibe `Number(`, `parseFloat`, `toFixed`, `Math.*`, `Intl.NumberFormat`). 4 slots `badge`/`action`; `action` acima do link (z-10), Tab separado, clique nao aciona o link. 5 medida desktop 1440. 6 medida mobile 390. 7 Skeleton mesma caixa (258x350 e 175x244). 8 axe (card completo, simples; skeleton). 9 stories Default/WithBadge/WithFavorite/Skeleton/Grid. 10 golden (21 PNG).

## RED (provado por asserção)
- Comportamento (esqueleto `return null`): `vitest run --project unit src/patterns/nft-card`: 11 failed | 2 passed; `Cannot find element with locator: getByRole('link', { name: 'Emerald Ape #042' })`. (Os 2 verdes: tipo sem alt e "sem badge/action nao ha botoes", triviais com null.)
- Medidas: 6 failed | 1 passed; `expected [ 258, 298 ] to deeply equal [ 258, 350 ]`, `expected [ 175, 223 ] to deeply equal [ 175, 244 ]`, `expected +0 to be 12`/`8`.
- Skeleton: 4 failed | 1 passed; `expected null not to be null`, `expected +0 to be 3`.
- Foco: `expected 'solid' to be 'none'` (outline do link).
- Golden: `A snapshot doesn't exist at .../linux/desktop-1440/patterns-nftcard--default.png` (21 falhas).
- Guardas sem RED (invariantes): axe e priceLabel. Mutacoes: remover `alt` do `<img>` -> `image-alt: Images must have alternative text`; `{Number(priceLabel)}` -> `expected [ '/\bNumber\s*\(/' ] to deeply equal []`; ambos restaurados.

## GREEN
- `pnpm exec vitest run --project unit src/patterns/nft-card`: 4 arquivos, 29 passed (apos o ciclo de foco).
- Ajustes de teste no GREEN (justificados): botoes de `action` com conteudo (botao vazio tem caixa 0x0, `toBeVisible` falha); `click({ force: true })` na imagem (o `::after` do link intercepta o ponteiro por desenho, Playwright recusa o click por actionability).
- `pnpm storybook:build`; `pnpm test:visual:docker --update-snapshots=changed -g patterns-nftcard`: `21 passed`; 2 reexecucoes sem update: `21 passed`, `21 passed`. 21 PNG (7 por viewport: default, default--focus, with-badge, with-favorite, with-favorite--focus, skeleton, grid) REVISADOS visualmente em 1440 e 390 (grid 3 colunas / 2 colunas, RARO no canto, coracao 28px, foco laranja no card inteiro, skeleton com a mesma caixa).
- Primeira geracao revelou story Grid quebrada (decorator de coluna do meta aplicado dentro do Grid); corrigida (decorator por story), baselines regeradas e revistas.

## Medidas (file.json)
Desktop (tela 2:2, Product Grid 70342:2830, cards 70342:2805/2808/2811): card 258x350, gap 12; midia 258x300 `surface-card` sem raio; arte 250x250 raio 15 (4:137) centralizada (offset 4/25); texto: titulo 16/400 lh16 foreground, preco 18/700 lh16 text-accent, gap 6. Mobile (14:5226, cards 175x244, grid 70395:242): midia 175x200 raio 20, gap 8, recuo do texto 8, titulo 15/400 (caixa 20), preco 16/700 lh16; badge a 0/16, favorito a 12 do topo e 11 da direita. Card fluido (`w-full`); breakpoint `tablet:` (768) separa as duas medidas (768 usa a desktop).

## Verificacao final
- `pnpm -r typecheck`, `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 64 arquivos, 701 passed.

## Lacunas / desvios
- Linha 1 do grid desktop (Frame 206) tem cards 258x356 (texto solto, gap 12, arte descentralizada); linhas 2-3 usam auto layout 350/gap 6. Adotada a variante 350 (2 de 3 linhas, auto layout); a de 356 fica descartada.
- Titulo mobile: Figma lhPx 19.78 (caixa 20); sem estilo de texto 15/400/lh20 em tokens: usado `text-body-15-regular-lh-16` + `leading-[20px]` (caixa 20).
- Imagem mobile e gradiente placeholder no Figma; aqui `object-cover` preenchendo a midia com raio 20.
- Posicao do badge/action no desktop nao esta no Figma (so mobile 15:5496/15:5465): reaproveitadas as do mobile.
- Foco: contorno 2px primary no card inteiro (`::after` do link), derivado; o Figma nao tem estado de foco.
- Skeleton derivado (ADR-12); barras de texto com largura 3/4 e 1/3 (sem medida no Figma).
- Titulo em `<h3>`; o consumidor define a hierarquia da pagina (axe ok isolado).
- `-g` do golden usa o id sem hifen entre `nft` e `card`: `patterns-nftcard` (id real do Storybook), nao `nft-card`.
- Hover do card nao implementado (sem estado desenhado, nao pedido).
