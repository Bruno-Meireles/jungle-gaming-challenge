# C3 Badge

Branch: `worktree-agent-a54aac24d295fea4d`. Commits: `49b4f94` test(red), `13bf0da` feat(green), `e6cc1ef` stories, + golden (este ciclo).

## Conferencia dos sub-itens (reexecutada)
1 count + aria-label, 2 label, 3 medida count (16x16, raio>=8, primary, ink, 10px/500, lh 13.19), 4 medida label (altura 32, padding 8/7, primary, ink, 13px/500/16; sem raio, canto reto do Figma nao replicado, Q20), 5 axe (count e label): `Badge.test.tsx`, 6 testes. Medidas rastreadas a file.json (comentario do teste). 6 stories `Count`/`Label` (tag `golden`). 
- `pnpm exec vitest run --project unit src/primitives/badge`: 1 arquivo, 6 passed.

## 7 Golden
- RED (`pnpm test:visual:docker` sem baselines): `6 failed | 9 passed`, `A snapshot doesn't exist at .../linux/<project>/primitives-badge--{count,label}.png`.
- GREEN: `pnpm test:visual:docker --update-snapshots=changed` (15 passed) e reexecucao sem update: `15 passed`. 6 PNG (3 viewports x 2 stories).
- Revisao visual: count = circulo primary 16px com "6" ink e contorno ink sobre faixa surface-card; label = retangulo primary com "RARO" ink, 48px de largura (o 68 do Figma e do retangulo do card, a largura aqui e do conteudo; so a altura 32 e testada).
- Nota: faixa da story tem 24px de altura (`h-24` com `--spacing:1px`), suficiente; baseline fixa esse recorte.

## Verificacao final
- `pnpm -r typecheck`, `pnpm -r lint`: limpos.
- `pnpm storybook:build`: ok.
- Lacunas: raio nominal do label ausente no Figma; contorno 2px do count nao medido em teste (ring-2, decisao registrada no codigo).
