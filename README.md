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
| Lighthouse (3 medições, mediana) | ver `ARCHITECTURE.md` / `tools/` (pendente se ausente) |
| Tudo | `pnpm verify` |

## Estrutura

`apps/web/src`: `app` (providers, router, bootstrap) › `pages` › `widgets` › `features` › `entities` › `shared`; imports apenas para baixo e sempre pelo `index.ts` do slice (lint). `mocks/` é a única camada com respostas fictícias. Decisões e desvios do Figma: `ARCHITECTURE.md`. Padrões: `.AI/standards/`.
