# Plano: checkout-orders (F6)

Autor: architect (condensado pelo orquestador). Rotas `/checkout` (Figma 11:2862 / 16:748) e `/orders/$orderId` (11:4385 modal).

## Decisao principal: anticorrupcao por portas (ADR-25)
A camada de negocio do Copilot ainda tem stubs. UI e maquina NAO importam entities/cart|order|user nem contracts/commerce. Widgets declaram portas (`CheckoutController`, `ReceiptSnapshot`); so dois adaptadores de pagina (`pages/checkout/model/use-checkout-controller.ts`, `pages/order-receipt/model/use-order-receipt.ts`) conhecem o Copilot (GREEN apos contrato 3.A entregue). Testes de UI usam duble da porta.

## Slices
- pages/checkout (checkout-access.ts pura `resolveCheckoutAccess`, CheckoutPage, adaptador)
- pages/order-receipt (receipt-state.ts `parseOrderId`/`toReceiptState`, OrderReceiptPage: >=768 Dialog sobre fundo Home, <768 pagina)
- widgets/checkout (ports.ts, can-confirm.ts, CheckoutView, OrderSummary)
- widgets/order-receipt (to-receipt-view.ts, OrderReceipt, OrderStatusPanel)
- features/place-order (domain/checkout-machine.ts pura, CheckoutNotice, ConfirmPurchaseButton)
- features/collector-form (collector-schema.ts, checkout-draft.ts, CollectorForm)
- features/wallet-connect (WalletNetworkPicker)
- shared/lib/navigation/private-access.ts, shared/lib/wallet/shorten-address.ts
- DS: PriceSummary, LineItemRow (patterns)

## Maquina (docs/flows.md s4)
Estados review{notice}|revalidating{expectedHash}|submitting{quoteHash,recovering}|placed{orderId}|session_expired.
CONFIRM{displayedHash,canConfirm} so em review com canConfirm. REVALIDATED{hash,canCheckout}: igual+ok -> submitting; hash diferente -> review quote_changed (novo clique); !canCheckout -> review unavailable. REVALIDATION_FAILED, SUBMIT_RECOVERING, ORDER_CREATED, SUBMIT_FAILED{reason} (session_expired -> estado proprio), QUOTE_UPDATED, SESSION_EXPIRED.
Pendente/Confirmado/Recusado vivem em /orders/$orderId (ReceiptState loading|not_found|error|pending|confirmed|refused).
canConfirm: form valido, conexao conectada, rede da conexao = rede selecionada, quote ready e canCheckout.

## Guards puros
`resolvePrivateAccess({session,href})` e `resolveCheckoutAccess({session,cartLineCount,href})` -> allow | {login,redirect via safeRedirect} | cart.

## Contrato pedido ao Copilot
Ver bloco 'F6 checkout-orders' em docs/agent-communication.md.

## Aceite A1-A15 e testes
Bloco S (sem Copilot): 1 private-access; 2 checkout-access; 3-6 maquina; 7 collector-schema; 8 can-confirm; 9 shorten-address; 10 checkout-draft; 11 receipt-state; 12 to-receipt-view; 13-14 DS PriceSummary/LineItemRow; 15 CheckoutNotice; 16 OrderSummary; 17 CollectorForm; 18 WalletNetworkPicker; 19 CheckoutView (duble: 3 cliques -> 1 revalidate, 1 placeOrder; hash diferente exige novo clique; recovering; created; session_expired); 20 OrderReceipt/StatusPanel; 21 medidas Figma.
Bloco C (apos Copilot): 22 adaptador; 23-31 E2E (guard, compra, falhas/timeout/idempotencia, cotacao, sessao, recibo, carteira, a11y, i18n) - feitos por outro agente ao final.

## Decisoes / Lacunas
Nomes: `refused`, `quote_changed` (existentes). L1 codigo indicacao e ENS obrigatorios; L2 provider unico; L3 endereco vem da carteira cadastrada; L4 cupom -> /cart; L5 explorerUrl simulado em nova aba; L6 mobile derivado do desktop; L7 fundo do recibo = Home (ADR-28). Desvios: data por Intl, botao Fechar acessivel, linha de desconto so se != 0.
Fora: Socket.IO (F7), carteiras CRUD (F8), carrinho (F5), deploy (F9).

## Rota (router.tsx)
checkoutRoute `/checkout` beforeLoad guardCheckout -> CheckoutPage; orderReceiptRoute `/orders/$orderId` beforeLoad guardPrivate -> OrderReceiptPage orderId (app/router/guards.ts + createRootRouteWithContext<{queryClient}>).
