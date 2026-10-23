# Status dos requisitos do prompt.md (seção `challenge`)

Legenda: **A** atendido (verificado por execução), **P** parcial, **X** pendente. Evidência = comando/arquivo executado nesta sessão. Atualizado em 2026-10-23. Itens de backend/tempo real/Lighthouse do Copilot estão em `docs/requirements-backend-status.md` (quando existir) e são consolidados no HANDOFF.md.

Comandos de verificação usados: `pnpm lint` (turbo, 2 pacotes), `cd apps/web && npx tsc --noEmit`, `npx vitest run` (node + Chromium), `PW_OUTPUT=... PORT=5180 npx playwright test --project=desktop-1440 --project=mobile-390`, `node ../../tools/e2e-preview.mjs` (E2E contra `vite preview` do build).

## §1–2 Escopo e stack
| Requisito | Status | Evidência |
|---|---|---|
| React + TypeScript | A | `pnpm build` (tsc -b + vite) ok |
| TanStack Router (rotas, search params, guards) | A | `app/router/router.tsx`, `guards.ts`; E2E `purchase-flow` (guard de /checkout), `auth-account` (expiração) |
| TanStack Query | A | entidades em `apps/web/src/entities/*`; política em ARCHITECTURE.md |
| Axios | A | `shared/api/http-client.ts` (único caminho REST) |
| Socket.IO | A | `entities/realtime`, `e2e/realtime.spec.ts` (8/8 segundo canal; reexecutar na suíte completa) |
| Tailwind + shadcn/ui (cópia manual sobre Radix) | A | `packages/design-system` (ADR-05) |
| MSW | A | `apps/web/src/mocks` |

## §3 Telas
| Tela | Status | Evidência / observação |
|---|---|---|
| Início (destaques, catálogo, busca, filtros, ordenação, paginação; banners, Diário da Cunhagem, Footer) | A | `e2e/home-*.spec.ts`, `home-lower-blocks.spec.ts` (1440/390/768) |
| Detalhe (galeria 4 imagens, edição, quantidade, favoritos, compra, breadcrumb, "Mais desta coleção") | A | `guest-cart.spec.ts`, `commerce-flows.spec.ts` |
| Carrinho (quantidade, remoção, cupom, resumo, "Colecionadores também viram") | A | `commerce-flows.spec.ts`, `purchase-flow.spec.ts` |
| Pagamento | A | `purchase-flow.spec.ts`, `commerce-flows.spec.ts` |
| Confirmação (modal desktop / página mobile; confirmado, pendente, recusado) | A | `commerce-flows.spec.ts`, `keyboard-focus.spec.ts` |
| Login / Cadastro | A | `auth-account.spec.ts` |
| Perfil / Carteiras | A | `auth-account.spec.ts` |
| Mobile 390, tablet 768, desktop 1440 sem overflow e sem violações axe | A | `screens-a11y.spec.ts` (pt-BR e en, 11 telas) |
| Fidelidade visual ao Figma | P | medidas dos componentes do DS e blocos principais por testes `*.measure.test.tsx`; telas montadas por composição sem comparação pixel a pixel (PNG do Figma não foi aberto por regra do usuário); desvios em ARCHITECTURE.md |

## §4–7 Integração, contratos, mocks, tempo real
Ver `docs/requirements-backend-status.md` (Copilot) e ARCHITECTURE.md. Itens verificados por mim na UI: otimismo com rollback (favoritos: `commerce-flows` "falha da mutation reverte"), recuperação sem duplicar (clique repetido = 1 POST; timeout = mesma Idempotency-Key), isolamento por usuário (`auth-account` troca de usuário), checkout com cotação alterada (`quote-changed-on-confirm`), expiração durante o checkout.

## §8 Interface e acessibilidade
| Requisito | Status | Evidência |
|---|---|---|
| Skeleton com shimmer + reduced motion | A | `commerce-flows` (catálogo, carrinho, detalhe lentos); `base.css` (reduced motion) |
| Teclado, foco visível, foco em diálogos | A | `keyboard-focus.spec.ts` |
| Labels e erros associados | A | `keyboard-focus.spec.ts` (aria-invalid/describedby); axe |
| Sem overflow horizontal | A | `screens-a11y.spec.ts` (390/768/1440) |
| Zoom/perda de conteúdo | P | sem teste automatizado de zoom 200%; layout fluido |

## §9 Testes Playwright (itens 1–12)
| # | Status | Arquivo |
|---|---|---|
| 1 busca/filtros/ordenação/paginação/histórico | A | `home-*.spec.ts` |
| 2 detalhe direto e inexistente | A | `guest-cart.spec.ts` |
| 3 cadastro, login, expiração, logout, troca de usuário | A | `auth-account.spec.ts` |
| 4 favoritos + falha | A | `commerce-flows.spec.ts` |
| 5 carrinho, quantidades, remoção, cupom, persistência refresh/login | A | `commerce-flows.spec.ts` |
| 6 compra completa | A | `purchase-flow.spec.ts` |
| 7 falha de pagamento, clique repetido, timeout | A | `commerce-flows.spec.ts` |
| 8 perfil, avatar, senha, carteiras | A | `auth-account.spec.ts` |
| 9–10 Socket.IO (preço no checkout, duplicados, desconexão/retomada) | P | `realtime.spec.ts` cobre preço, pedido, replay, logout; fila do Copilot item 5 acrescenta checkout/pendente/outro usuário |
| 11 teclado/foco/validação | A | `keyboard-focus.spec.ts` |
| 12 skeleton, falha, nova tentativa | A | `commerce-flows.spec.ts` |
| Regressão visual (início, detalhe, carrinho, pagamento) com baselines | A | `visual.spec.ts` (+ snapshots win32, estáveis em 2 execuções); baselines só valem na plataforma que as gerou |
| Relatório HTML e traces | A | `playwright.config.ts` (reporter html, trace retain-on-failure) |

## §10 Lighthouse — ver HANDOFF.md / docs/lighthouse (Copilot, fila item 2): **X até medir**.

## §12 Entrega
| Requisito | Status | Evidência |
|---|---|---|
| README (setup, env, credenciais, cenários/reset, comandos) | A | `README.md` (revisão dos comandos: fila do Copilot item 7) |
| ARCHITECTURE.md (contratos, sessão, carrinho, cache, reconciliação, desvios) | P | seção do Copilot publicada; correções e seções finais na fila item 1 |
| Scripts: dev com mocks, build, preview, typecheck, lint, Playwright, Lighthouse | P | todos existem exceto Lighthouse (fila item 2) |
| Deploy público (Vercel) | X | `vercel.json` pronto; CLI sem login nesta máquina (ver HANDOFF.md) |
| Checkout limpo | P | fila do Copilot item 6 |
