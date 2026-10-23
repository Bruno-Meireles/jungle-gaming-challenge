# Kurio — marketplace de NFTs (desafio Jungle Gaming)

Front-end em React 19 + TanStack Router/Query + Axios + MSW (API simulada) + Socket.IO client (tempo real simulado), organizado em Clean Architecture + Feature-Sliced Design, num monorepo pnpm + Turborepo com dois pacotes: `apps/web` (app) e `packages/design-system` (DS).

## Setup

Requisitos: Node 24 (`.nvmrc`) e pnpm (versão fixada em `packageManager`).

```bash
pnpm install
pnpm dev            # app em http://localhost:5173 com mocks MSW ligados (VITE_ENABLE_MOCKS=true)
```

Não há backend nem Docker: toda a API (REST e Socket.IO) é simulada no navegador pelo MSW.

## Variáveis de ambiente

| Variável | Onde | Efeito |
|---|---|---|
| `VITE_ENABLE_MOCKS` | `apps/web/.env.development`, `.env.production` | `true` liga o worker MSW (também no build de demonstração/deploy). |

## Credenciais fictícias

| Usuário | E-mail | Senha | Estado |
|---|---|---|---|
| Ana | `ana@example.test` | `JungleDemo-Ana-2026!` | carteira principal + secundária, carrinho semeado, pedido `ord-ana-0001` |
| Bruno | `bruno@example.test` | `JungleDemo-Bruno-2026!` | sem carteira, carrinho vazio |

Senhas ficam só como hash + sal no estado simulado. Cupons: `LAUNCH10` (válido), `EXPIRED2025` (expirado).

## Cenários e reset

O estado simulado persiste em `localStorage` (sobrevive ao refresh). Controles por URL (só com mocks ativos):

- `/?mockReset=1` restaura integralmente o seed conhecido (usuários, sessões, carrinho, pedidos, favoritos, mercado).
- `/?mockScenario=<id>` ativa um cenário (`default` volta ao normal). Combine: `/?mockReset=1&mockScenario=cart-sold-out`.

Cenários: `default`, `catalog-empty`, `catalog-error`, `catalog-flaky`, `catalog-slow`, `catalog-out-of-order`, `auth_network_error`, `auth_server_error`, `nft-detail-slow`, `nft-detail-error`, `wallet-rejected`, `cart-seeded`, `cart-error`, `quote-error`, `cart-slow`, `cart-price-changed`, `cart-sold-out`, `cart-mutation-error`, `cart-availability-conflict`, `quote-sold-out`, `quote-changed-on-confirm`, `order-refused`, `order-pending`, `order-timeout`, `checkout-session-expired`, `orders-error`, `catalog-repriced`, `favorites-error`.

## Comandos

| Objetivo | Comando |
|---|---|
| Dev com mocks | `pnpm dev` |
| Build (DS + app) | `pnpm build` |
| Preview do build | `pnpm --filter @jg/web exec vite preview` |
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Testes unitários/integração (Vitest, Chromium real) | `pnpm test` |
| E2E (Playwright) | `pnpm --filter @jg/web test:e2e` |
| Um E2E | `pnpm --filter @jg/web exec playwright test e2e/purchase-flow.spec.ts -g "compra completa"` |
| Regressão visual do DS | `pnpm test:visual` |
| Lighthouse (12 auditorias; 3 medições por rota/perfil, mediana) | `pnpm lighthouse` (servidor estático comprimido em `tools/serve-static.mjs`; relatórios em `docs/lighthouse/`; código diferente de zero enquanto alguma meta não for atingida); na URL publicada: `LIGHTHOUSE_BASE_URL=<url> pnpm lighthouse` |
| Tudo | `pnpm verify` |

O Lighthouse mede o build de produção com o servidor estático local, que habilita Brotli/gzip, fallback SPA, cache imutável de `/assets` e cache de sete dias para imagens NFT estáticas. Os relatórios novos usam o sufixo `vercel-static` para preservar as medições anteriores feitas com `vite preview`. A regra atual de `/nfts/(.*)` no `vercel.json` também cobre rotas HTML sem extensão; a medição local deixa esses documentos `no-cache`, e essa diferença está registrada no resumo enquanto aguarda alinhamento da regra de deploy.

### Reproduzir cenários de falha

Com `pnpm dev` ativo e mocks habilitados, abra `http://localhost:5173/?mockReset=1&mockScenario=<id>` para iniciar do seed conhecido com o cenário desejado. Em seguida, navegue para a tela indicada. Para cenários privados, autentique-se com Ana (`ana@example.test` / `JungleDemo-Ana-2026!`) antes de abrir a rota. Resultados esperados:

| Cenário                           | Tela/ação                                                        | Resultado esperado                                                                                        |
| --------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `catalog-empty`                   | Home (`/`)                                                       | Estado vazio, sem cards; “Limpar filtros” restaura a listagem.                                            |
| `catalog-error`                   | Home (`/`)                                                       | Alerta de falha e “Tentar novamente”; a falha persiste.                                                   |
| `catalog-flaky`                   | Home (`/`)                                                       | Falha inicial; “Tentar novamente” carrega os NFTs.                                                        |
| `catalog-slow`                    | Home (`/`)                                                       | Skeleton durante a espera e cards após a resposta.                                                        |
| `catalog-out-of-order`            | Home (`/`); alterne “Em alta” e “Novos lançamentos”              | A resposta lenta anterior não substitui os resultados nem a aba mais recente.                             |
| `auth_network_error`              | Login (`/login`)                                                 | Erro de conexão recuperável; não autentica.                                                               |
| `auth_server_error`               | Login (`/login`)                                                 | Erro de indisponibilidade do servidor; não autentica.                                                     |
| Credenciais inválidas             | Login (`/login`); use e-mail da Ana com senha incorreta          | Mensagem de credenciais inválidas e sessão permanece anônima.                                             |
| Conflito de cadastro              | Cadastro (`/signup`); use `ana@example.test`                     | E-mail já utilizado é associado ao campo; a conta não é criada.                                           |
| `nft-detail-slow`                 | Detalhe (`/nfts/emerald-ape-042`)                                | Região ocupada/skeleton até os dados do NFT carregarem.                                                   |
| `nft-detail-error`                | Detalhe (`/nfts/emerald-ape-042`)                                | Erro com “Tentar novamente”; após voltar ao cenário `default`, a tentativa carrega o NFT.                 |
| `favorites-error`                 | Após login, detalhe de um NFT; acione Favoritar                  | A falha da mutation reverte o estado otimista do favorito.                                                |
| `cart-slow`                       | Após login, carrinho (`/cart`)                                   | Skeleton do carrinho enquanto a resposta está lenta; itens aparecem depois.                               |
| `cart-error`                      | Após login, carrinho (`/cart`)                                   | Erro de carregamento e opção de tentar novamente; `default` recupera os itens.                            |
| `cart-mutation-error`             | Após login, carrinho (`/cart`); altere quantidade ou remova item | A mutation falha e o carrinho mantém o estado confirmado anterior.                                        |
| `cart-availability-conflict`      | Detalhe de NFT; tente adicioná-lo ao carrinho                    | API responde conflito de disponibilidade (409); item não é adicionado.                                    |
| Cupom inválido/expirado           | Após login, carrinho (`/cart`); aplique `NOPE` ou `EXPIRED2025`  | Erro de validação informa que o cupom é inválido ou expirado; não é aplicado.                             |
| `quote-error`                     | Após login, carrinho ou checkout                                 | Cotação indisponível; compra não deve ser confirmada com cotação ausente.                                 |
| `cart-price-changed`              | Após login, carrinho/checkout; atualize a cotação                | Preço do item muda para `1.29 ETH` e a cotação é sincronizada antes da compra.                            |
| `cart-sold-out`, `quote-sold-out` | Após login, carrinho/checkout; atualize a cotação                | Edição fica indisponível; API informa conflito e checkout não deve concluir a compra.                     |
| `quote-changed-on-confirm`        | Após login, checkout; clique “Confirmar compra”                  | Aviso “A cotação mudou. Revise os valores e confirme novamente.”; só a segunda confirmação cria o pedido. |
| `checkout-session-expired`        | Após login, checkout; confirme a compra                          | Sessão expira e redireciona ao login preservando o destino `/checkout`.                                   |
| `wallet-rejected`                 | Após login, checkout; tente conectar uma carteira                | Conexão recusada; compra não avança como se a carteira estivesse conectada.                               |
| `order-refused`                   | Após login, checkout; conclua a compra                           | Recibo mostra “Pagamento recusado”, sem estado de pagamento aprovado.                                     |
| `order-pending`                   | Após login, conclua a compra e abra o recibo                     | Recibo apresenta estado pendente e pode ser atualizado via Socket.IO/recuperado por REST.                 |
| `order-timeout`                   | Após login, checkout; confirme a compra                          | Falha de rede após criação é recuperada com a mesma chave de idempotência, sem pedido duplicado.          |
| `orders-error`                    | Após login, abra `/orders/ord-ana-0001`                          | A consulta do pedido falha com indisponibilidade; não exibe sucesso fictício.                             |

## Idioma

O app suporta pt-BR e inglês. **Não há seletor visual de idioma** (ele não existe no Figma): a troca é feita apenas pela URL.

- Forçar o idioma em qualquer rota: `/?lang=pt-BR`, `/?lang=en`, `/nfts/emerald-ape-042?lang=en`, `/cart?lang=pt-BR`. Valores inválidos são ignorados.
- Prioridade: `?lang=` válido, preferência salva (`localStorage jg:locale`), idioma do navegador e, por último, pt-BR.
- Um `?lang=` válido também grava a preferência salva e atualiza `<html lang>`; assim o idioma permanece ao navegar e ao recarregar a página sem o parâmetro. Para voltar ao idioma do navegador, limpe `jg:locale` do armazenamento local.

## Estrutura

`apps/web/src`: `app` (providers, router, bootstrap) › `pages` › `widgets` › `features` › `entities` › `shared`; imports apenas para baixo e sempre pelo `index.ts` do slice (lint). `mocks/` é a única camada com respostas fictícias. Decisões e desvios do Figma: `ARCHITECTURE.md`. Padrões: `.AI/standards/`.

## Deploy público

https://jungle-gaming-challenge-lemon.vercel.app (Vercel, mocks MSW ativos). Publicado via `vercel deploy --prod --archive=tgz`; `.vercelignore` mantém o upload enxuto.
