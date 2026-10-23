# Matriz de requisitos de integração, mocks e tempo real

Fonte da verdade: `prompt.md`, seções 4–7. Atualizado em 2026-10-23.

**Legenda:** Atendido = implementação e evidência de execução cobrem o requisito; Parcial = implementação existe, mas a validação ou um subcomportamento ainda não foi confirmado; Pendente = não implementado ou sem evidência executada. Esta matriz não declara requisitos de interface nem de deploy.

## Execuções que fundamentam os status

| Comando ou teste | Resultado observado |
|---|---|
| `pnpm test` | Passou: `apps/web` 102 arquivos, 1141 testes e 8 TODOs; `packages/design-system` 75 arquivos, 1007 testes. |
| `pnpm typecheck` em checkout limpo no commit `4121f36` | Passou nos dois pacotes. `pnpm verify` também concluiu lint, typecheck, build e Vitest sem falhas. |
| `pnpm --filter @jg/web test:e2e` | 319/326 passaram; 7 falharam com timeouts/assertions durante a execução paralela de 8 workers. |
| `pnpm verify` | 8/9 tarefas passaram; 313 E2Es passaram e 13 falharam. A execução coincidiu parcialmente com alterações de imagem/UI não commitadas por Claude; não foi usada como prova de regressão atribuível a uma única alteração. |
| `PORT=5190`, `PW_OUTPUT=test-results-realtime-copilot-verify`, `playwright test e2e/realtime.spec.ts --project=desktop-1440` | Passou 7/7 no desktop. |
| Mesmo comando com `--project=mobile-390 --workers=1` | Passou 7/7 no mobile. |
| `playwright test e2e/purchase-flow.spec.ts -g "compra completa"` | Passou 2/2, desktop e mobile. |
| `node ../../tools/e2e-preview.mjs e2e/guest-cart.spec.ts --project=desktop-1440` em checkout limpo | Passou 6/6 contra `vite preview`. |

Os resultados das suítes E2E completas não estão totalmente verdes. As falhas observadas ocorreram sobretudo sob carga/concorrência; a suíte realtime isolada passou nos dois viewports. Revalidar os fluxos completos depois de Claude sinalizar que as alterações em andamento foram concluídas.

## §4 Integração e estado

| Requisito | Status | Evidência executada |
|---|---|---|
| TanStack Router para rotas, parâmetros e proteção de fluxos privados; TanStack Query para consultas e mutations; Axios como transporte REST | Atendido | `pnpm typecheck`; [router](../apps/web/src/app/router/router.tsx), [cliente HTTP](../apps/web/src/shared/api/http-client.ts), [consultas de sessão](../apps/web/src/entities/session/model/session-query.ts). `guest-cart.spec.ts` passou 6/6 no preview limpo. |
| Contratos tipados entre transporte, estado e interface | Atendido | `pnpm typecheck`; schemas Zod em `apps/web/src/shared/api/contracts/` e testes em `contracts/nfts.node.test.ts`, `http-client-send.node.test.ts` e `commerce-api.node.test.ts`. |
| Estados de carregamento, vazio, erro, sucesso e atualização em segundo plano | Atendido | `home-states.spec.ts`, `commerce-flows.spec.ts` e [testes de catálogo](../apps/web/src/mocks/catalog/query-catalog.node.test.ts); Vitest passou. |
| Invalidação coerente após mutations e eventos | Atendido | [política documentada](../ARCHITECTURE.md) e [sincronização de consultas](../apps/web/src/app/realtime/query-sync.ts); `realtime.spec.ts` passou 7/7 em desktop e mobile. |
| Cancelar ou descartar respostas obsoletas | Atendido | [busca de catálogo propaga AbortSignal](../apps/web/src/entities/nft/api/fetch-catalog-page.ts); `home-out-of-order.spec.ts` verifica que a resposta anterior não substitui a aba mais recente. |
| Isolar dados por usuário e parâmetros da consulta | Atendido | `commerce-api.node.test.ts` verifica favoritos Ana/Bruno isolados; `orders-api.node.test.ts` verifica pedido de outro usuário não exposto; `business-api.node.test.ts` cobre carteiras por usuário. `pnpm test` passou. |
| Recuperar falhas sem duplicar operações | Atendido | `commerce-api.node.test.ts` verifica replay idempotente e conflito para conteúdo diferente; `commerce-flows.spec.ts` cobre timeout; `purchase-flow.spec.ts -g "compra completa"` passou 2/2. |
| Tratar rotas inexistentes e acesso direto | Atendido | `guest-cart.spec.ts` cobre detalhe inexistente e acesso direto; `routes.spec.ts` cobre rotas de erro. Checkout limpo: `guest-cart.spec.ts` passou 6/6 em preview. |
| Atualização otimista com rollback | Atendido | `commerce-flows.spec.ts` cobre rollback de favoritos; `apps/web/src/entities/cart/model/use-cart-mutations.ts` e `features/favorites` implementam otimismo/rollback. Vitest passou; E2E completo teve falhas sob carga e será revalidado. |
| Documentar política de cache, retries e sincronização | Atendido | [Política de cache, retries e sincronização](../ARCHITECTURE.md) registra stale time, retry transitório, cancelamento, polling e invalidação. |

## §5 Contratos REST

| Recurso/requisito | Status | Evidência executada |
|---|---|---|
| Sessão e conta: cadastro, login, consulta, logout e expiração | Atendido | `business-api.node.test.ts` cobre login, cadastro, credenciais inválidas, sessão anônima/inválida, logout, erros de rede/503 e persistência. `auth-account.spec.ts` cobre retomada após expiração. |
| NFTs: listagem com busca/filtros/ordenação/paginação e detalhe | Atendido | `catalog/query-catalog.node.test.ts` cobre combinação de filtros, ordenação, paginação, facetas e vazio; `commerce-api.node.test.ts` verifica NFT inexistente (404) e edição esgotada. Vitest passou. |
| Favoritos: consulta, inclusão, remoção e isolamento | Atendido | `commerce-api.node.test.ts` verifica inclusão e isolamento Ana/Bruno; implementação em handlers MSW. Vitest passou. |
| Carrinho: consulta, inclusão, alteração, remoção e limite de disponibilidade | Atendido | `commerce-api.node.test.ts` verifica merge visitante, conflito acima do máximo e persistência de PATCH; `commerce-flows.spec.ts` cobre fluxo de UI. Vitest passou. |
| Cotação: cupom, disponibilidade, descontos, taxas e total | Atendido | `commerce/quote-engine.node.test.ts` verifica BigInt, cupom, indisponibilidade e hash; `commerce-api.node.test.ts` verifica `quote_changed` e cupons 422. Vitest passou. |
| Pedidos: criação idempotente e consulta do estado/recibo | Atendido | `commerce-api.node.test.ts` verifica replay, conflito de chave e conteúdo, e `orders-api.node.test.ts` verifica autorização/isolamento do detalhe. E2E singular de compra passou 2/2. |
| Perfil: consulta, edição, avatar e senha | Atendido | `business-api.node.test.ts` verifica atualização persistida, conflito de conta e troca de senha sem armazenar senha em claro. Vitest passou. |
| Carteiras: consulta, cadastro/atualização e isolamento | Atendido | `business-api.node.test.ts` verifica carteira principal/secundária, edição, endereço inválido e isolamento entre Ana/Bruno. Vitest passou. |
| Erros de validação, sessão, permissão, recurso ausente, conflito e falha transitória | Atendido | `business-api.node.test.ts`, `orders-api.node.test.ts`, `commerce-api.node.test.ts` e `scenario.node.test.ts` verificam os códigos/status correspondentes; Vitest passou. |
| Idempotência: mesma chave/conteúdo recupera pedido; conteúdo diferente conflita | Atendido | `commerce-api.node.test.ts` verifica respostas 200/201 no replay e 409 `idempotency_conflict` para conteúdo diferente; execução incluída em `pnpm test`, que passou. |

Os endpoints, payloads, respostas e códigos de erro estão consolidados em [ARCHITECTURE.md](../ARCHITECTURE.md), seção “Contratos de negócio e integração do app”.

## §6 Mocking com MSW

| Requisito | Status | Evidência executada |
|---|---|---|
| Reutilizar contratos e cenários na camada MSW; não fabricar respostas em componentes, hooks ou Axios | Atendido | Handlers em `apps/web/src/mocks/handlers/`; contratos em `apps/web/src/shared/api/contracts/`; busca `rg` nas áreas `pages`, `widgets`, `features`, `entities` e `shared` encontrou usos de `HttpResponse` apenas em arquivos de teste. `pnpm build` e `pnpm test` passaram. |
| Manter estado consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos | Atendido | Estado compartilhado em `apps/web/src/mocks/commerce/`; `business-api.node.test.ts`, `commerce-api.node.test.ts` e `orders-api.node.test.ts` verificam mutações e isolamento. Vitest passou. |
| Persistir estado para refresh e resetar seed conhecido | Atendido | `business-api.node.test.ts`, `reset.node.test.ts` e `commerce-api.node.test.ts` verificam persistência/reset e merge; E2E de carrinho cobre refresh/login. |
| Reproduzir latência, falha de rede/HTTP, expiração, autorização, validação e conflitos | Atendido | `scenario.node.test.ts`, handlers MSW e testes E2E `home-states.spec.ts`, `auth-account.spec.ts` e `commerce-flows.spec.ts`; Vitest passou. |
| Fixtures variadas, dois usuários e cenários determinísticos | Atendido | `fixtures/nfts.node.test.ts` verifica 45 NFTs em cinco páginas e variedade de coleções/redes; `business-api.node.test.ts` verifica Ana/Bruno; `scenario.node.test.ts` valida cenários conhecidos. |
| Eventos simulados por MSW compatível com Socket.IO, exercitando `socket.io-client` real | Atendido | [handler de socket MSW](../apps/web/src/mocks/realtime/socket-handler.ts), [cliente realtime](../apps/web/src/entities/realtime/model/use-realtime-sync.ts) e `realtime.spec.ts`; realtime passou 7/7 em desktop e 7/7 em mobile. |
| Mocks configuráveis e presentes no build de demonstração; REST e eventos refletem mudanças | Atendido | `apps/web/.env.production` define `VITE_ENABLE_MOCKS=true`; `pnpm build` passou no checkout limpo. Testes realtime cobrem alteração de NFT e pedido por REST/evento. |

Limitações do transporte simulado e ativação dos mocks estão registradas em [ARCHITECTURE.md](../ARCHITECTURE.md), seções “Mock e inicialização” e “Transporte Socket.IO nos mocks e limitações”.

## §7 Tempo real com Socket.IO

| Requisito | Status | Evidência executada |
|---|---|---|
| `nft.updated` atualiza preço/disponibilidade; `order.updated` atualiza pedido | Atendido | Schemas em `shared/api/contracts/realtime.ts`, aplicação em `app/realtime/query-sync.ts`; `realtime.spec.ts` verifica mudança de preço e estado do pedido. Realtime passou 7/7 por viewport. |
| Eventos têm identidade estável, recurso e versão; duplicatas/versões antigas não regridem estado | Atendido | `realtime.ts` define `eventId`, `resource`, `version`, `occurredAt`; `use-realtime-sync.ts` deduplica e compara versões; caso E2E “ignora eventos duplicados e versões antigas” passou nos dois viewports. |
| Reconciliar via REST após reconexão | Parcial | `use-realtime-sync.ts` invoca reconciliação ao conectar e `query-sync.ts` invalida consultas. E2E verifica interrupção seguida de reload/recuperação por REST (passou 7/7 nos testes realtime), mas não há evidência isolada de reconexão automática do mesmo socket sem reload. |
| Evento privado de sessão anterior/usuário diferente não altera pedido atual; liberar listeners no teardown | Atendido | `socket-handler.ts` filtra por usuário identificado; `realtime.spec.ts` cobre evento de outro usuário e logout/fechamento do socket, ambos na suíte 7/7 desktop e mobile. |
| Alteração de preço/disponibilidade durante checkout invalida cotação e bloqueia confirmação obsoleta | Atendido | E2E “preco atualizado no checkout impede confirmacao com a cotacao antiga” e caso `quote-changed-on-confirm`; ambos passam na suíte realtime isolada em desktop e mobile. |
| Interrupção com pedido pendente permite recuperar estado sem criar outra compra | Atendido | E2E `order-pending` interrompe o socket e recarrega o recibo; a consulta REST recupera o pedido existente. Suíte realtime isolada passou em desktop e mobile; os testes de idempotência MSW também passaram. |
| Estados de pedido confirmado/recusado são terminais | Atendido | Transições e polling documentados em [ARCHITECTURE.md](../ARCHITECTURE.md); `commerce-flows.spec.ts` e `realtime.spec.ts` exercitam pedido recusado e atualização do pedido. Vitest passou. |
