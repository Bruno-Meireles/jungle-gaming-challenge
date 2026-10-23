# Plano: cart (F5, rota /cart)

Autor: architect. Figma desktop `11:1278`, mobile `16:360`. Claude = apresentacao; Copilot/agentes de negocio = contrato, persistencia, MSW. Contratos de negocio estavam vazios na criacao do plano (UI por props; container e E2E bloqueados ate "DESTRAVADO" no canal).

## Decisoes
- C1 Totais nunca calculados no cliente: subtotal, desconto, taxa, total e total por linha vem de CartQuote. Durante recalculo mostra valor anterior com aria-busy.
- C2 Formatacao `formatEthFixed(value, locale, 2)` (shared/lib/eth). Sem Number/parseFloat.
- C3 Desconto sempre visivel: "(-) 0,00 ETH".
- C4 DS QuantityStepper: `size 'md'|'sm'` (sm: botoes 20x30, raio 20, gap 12) e `<input inputMode=numeric>` com nome acessivel; commit em Enter/blur; clamp/revert; ArrowUp/Down. TDD no DS; corrigir testes antigos do `<output>` com justificativa.
- C5 Minimo 1; remover e acao separada (icone em todas as linhas; desvio do mobile).
- C6 "Conectar e finalizar": `resolveCheckoutTarget(isAuthenticated)` puro com safeRedirect -> `/checkout` ou `/login?redirect=/checkout`. Desabilitado (aria-describedby) se cotacao pendente/erro, linha sold_out ou quantity>maxQuantity. Mudanca de preco so informa.
- C7 `/checkout` vira stub (UnavailablePage, feature `checkout`) ate F6.
- C8 Linhas em `<ul>/<li>`; cabecalho de colunas aria-hidden; titulo e link para /nfts/<id>.
- C9 Desktop: Breadcrumb + h1 oculto. Mobile: cabecalho de tela com Voltar + h1. Header/BottomNav globais mantidos.
- C10 Avisos price_changed / availability_reduced / sold_out com icone+texto; LiveRegion polite; erros de mutation role=alert.
- C11 Badge do Header = soma das quantidades, oculto em 0, aria-label com plural.
- C12 Widget related-nfts (useCatalogQuery sort popular, 5 primeiros fora do carrinho, so >=768).
- C14 Sem search params. C15 Cupom: trim; vazio -> `required` so no cliente.
- C16 Sem debounce/estado paralelo: otimismo e rollback sao do hook.

## Slices (apps/web/src)
- DS: primitives/quantity-stepper (size + input).
- pages/cart: index.ts {CartPage}; model/cart-page-state.ts (loading|error|empty|ready); model/cart-input.ts (tipos temporarios); ui/CartPageView, CartScreenHeader, CartEmpty, CartError, CartPage (container, BLOQUEADO); locales ns pageCart.
- widgets/cart-lines (CartLines, CartLineItem, CartLineNotice, CartLinesSkeleton, toCartLineViewModel; ns cartLines).
- widgets/cart-summary (CartSummary, SummaryRow, skeleton, toCartSummaryViewModel; ns cartSummary).
- widgets/related-nfts; widgets/header + CartBadge (BLOQUEADO).
- features/cart-line-controls (LineQuantityControl, RemoveLineButton), features/cart-coupon (normalizeCouponInput, CouponForm), features/checkout-cta (resolveCheckoutTarget, CheckoutCta).
- shared/ui/icons: DeleteIcon, ArrowLeftIcon, WarningIcon; pages/unavailable/model/features.ts + 'checkout'.
- Rota: remover `stubRoute('/cart','cart')`; `createRoute({getParentRoute: () => rootRoute, path:'/cart', component: CartPage})`; `stubRoute('/checkout','checkout')`.

## Contrato (pedido ao Copilot; shapes)
CartLine {lineId,nftId,title,image{src,width,height},tokenId,edition{id,number,supply},unitPrice,quantity>=1,maxQuantity}; Cart {lines,couponCode,itemCount,version}; LineNotice = price_changed{previousUnitPrice,unitPrice} | availability_reduced{available} | sold_out; QuoteLine {lineId,unitPrice,quantity,lineTotal,notice}; CartQuote {quoteId,cartVersion,lines,subtotal,discount,networkFee,total,coupon,expiresAt}; CartFailure; CouponFailure (coupon_invalid|coupon_expired|required|network|unexpected). Hooks: useCart, useCartQuote, useCartItemCount, useUpdateCartLine, useRemoveCartLine, useApplyCoupon, useRemoveCoupon; entities/session useSession.

## View models
CartLineViewModel {lineId,title,href,image{src,alt},tokenLabel,editionLabel,unitPriceLabel,lineTotalLabel|null,quantity,min:1,max,canIncrement,notice,blocking}; CartSummaryViewModel = loading|error|ready{subtotal,discount,networkFee,total,couponCode,busy}; disabledReason 'quote_pending'|'quote_error'|'line_blocking'|null.

## Aceite
Stepper sm + input; ETH da API formatado por idioma; estados vazio/loading(skeleton)/erro+retry; quantidade respeitando maxQuantity; remocao com anuncio/foco; cupom aplica/remove com erros associados ao campo; avisos com texto e CTA bloqueado em conflito; CTA anonimo -> login?redirect=/checkout; persistencia (Copilot, E2E); teclado/axe/layout 1440/768/390; medidas do Figma.

## Testes RED (rodam agora: 1-17; bloqueados B: 18-31)
1 DS stepper sm medidas; 2 DS stepper input; 3 resolveCheckoutTarget; 4 toCartLineViewModel; 5 toCartSummaryViewModel; 6 toCartPageState; 7 normalizeCouponInput; 8 paridade i18n dos 7 namespaces; 9 CartLineItem; 10 CartLines+skeleton; 11 CouponForm; 12 CartSummary (LiveRegion, skeleton, erro com retry); 13 CheckoutCta; 14 CartEmpty/CartError; 15 CartPageView; 16 medidas Figma (file.json); 17 RelatedNfts. B: 18 badge, 19 rotas, 20 CartPage container+MSW, 21-31 E2E (render, quantidade, remocao, cupom, persistencia, CTA, estados, mudancas, rollback, a11y, layout).

## Lacunas
L1 e L2 RESOLVIDAS em decisions.md e no canal (02:50). Restam: R1 conferir usos de QuantityStepper; R2 useCanGoBack nos tipos do TanStack Router; R3 NftCard 219x255.

## ADRs para ARCHITECTURE.md
ADR-25 carrinho sem calculo no cliente; ADR-26 UI por view model; ADR-27 QuantityStepper editavel com tamanhos; ADR-28 CTA + stub de checkout. Desvios do Figma: remover em todas as linhas mobile; Header/BottomNav globais; h1 oculto desktop; contador = soma; relacionados sem pontos e so >=768; separador decimal por idioma; "(-) 0,00 ETH".
