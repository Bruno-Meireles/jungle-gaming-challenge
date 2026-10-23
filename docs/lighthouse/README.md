# Lighthouse

O runner executa três auditorias para cada combinação de rota e viewport: Home e detalhe de NFT, em mobile e desktop. O gate exige medianas de Performance ≥90, Accessibility ≥95, Best Practices ≥95 e SEO ≥90. A execução registrada em `summary.json` foi feita no build de produção, com o servidor estático local, compressão Brotli/gzip, MSW ativo e cenário default.

## Resultado mais recente

| Rota        | Perfil  | Performance | Accessibility | Best Practices | SEO | LCP (ms) |     CLS | TBT (ms) |
| ----------- | ------- | ----------: | ------------: | -------------: | --: | -------: | ------: | -------: |
| Home        | Mobile  |          49 |           100 |            100 | 100 |     4563 | 0.00055 |     1563 |
| Home        | Desktop |          30 |           100 |            100 | 100 |     4964 | 0.00162 |     1513 |
| Detalhe NFT | Mobile  |          58 |           100 |            100 | 100 |     4971 | 0.02058 |      606 |
| Detalhe NFT | Desktop |          32 |           100 |            100 | 100 |     5234 | 0.04716 |      778 |

Accessibility, Best Practices e SEO atingem as metas. Performance fica abaixo de 90 nas quatro combinações.

## Interpretação e restrições

O build público deve manter `VITE_ENABLE_MOCKS=true`, conforme o requisito do desafio. Por isso, o build de produção inclui o cliente MSW: a saída do build medido contém um chunk `browser-*` de 468.84 kB, além do worker `mockServiceWorker.js`. O bundle principal também é grande (509.63 kB na mesma build). O boot e a avaliação de JavaScript são compatíveis com os valores elevados de Total Blocking Time, especialmente na Home (medianas de 1513–1563 ms).

Esses números indicam um gargalo de execução/boot JavaScript, mas não provam que o MSW sozinho cause o TBT: Lighthouse mede o trabalho total da página e sua auditoria não isola a contribuição de cada dependência. Desativar os mocks não é uma otimização aceitável, pois quebraria o requisito de demonstração. Uma eventual redução do custo deve preservar os mocks ativos e ser validada com novas medições.

O resumo ainda mantém a baseline anterior de Performance `34/28/55/32` e as auditorias intermediárias. A execução atual melhorou para `49/30/58/32`, mas não alcançou o gate de Performance. Consulte os relatórios JSON/HTML por combinação para os diagnósticos e amostras individuais.

## Reconexão Socket.IO

A cobertura E2E atual confirma recuperação do pedido pendente por REST após interromper o socket e recarregar a página. Embora o cliente configure reconexão automática e invoque a reconciliação ao conectar, ainda não há um teste E2E isolado que confirme a recuperação do mesmo socket sem reload. Por isso, esse requisito segue **Parcial** na [matriz de requisitos](../requirements-backend-status.md), até existir essa evidência.
