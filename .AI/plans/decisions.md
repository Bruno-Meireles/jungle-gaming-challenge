# Decisoes de contrato (canal Claude/Copilot)

Fonte completa: docs/agent-communication.md. Resumo vigente (2026-10-22):
- Auth: SessionUser {id, displayName, username, email, avatarUrl|null}; GET /auth/session -> {user|null} ou 401 session_invalid (ambos = anonimo, apaga token); login/register -> {token, user, expiresAt(epoch ms)}.
- 409 account_conflict com fields ('email'|'username')[]; 400 validation_failed; 401 invalid_credentials.
- Token em localStorage 'jg.session.token'. Cache: sessionKeys.current().
- Cadastro: {username,email,password,confirmPassword}; password_mismatch so no cliente; displayName = username na API (desvio do Figma, registrar em ARCHITECTURE.md).
- Modal desktop de login/cadastro: fundo = Home inert.
- Credenciais ficticias: ana@example.test / bruno@example.test (senhas na doc de demo).
- Cenarios MSW: auth_network_error, auth_server_error.
- Mock auth: getAuthenticatedUserId(request) em mocks/auth/session-auth.ts (Bearer -> userId|null; 401 session_invalid).
- mergeGuestCart(guestId,userId): soma quantidades limitada ao maximo, mantem cupom do usuario, apaga carrinho visitante, idempotente.
- Raizes de cache privadas: ['cart'],['orders'],['favorites'],['realtime'] limpas no logout.
- Carrinho aceita visitante (X-Guest-Cart-Id), persiste e e mesclado no login; cache ['cart'] limpo no logout. Favoritos/pedidos/checkout/conta exigem auth.
- useSession: status unknown|anonymous|authenticated; guards aguardam unknown.
- Ordem do Copilot: auth > nft detail > favoritos > carrinho > pedidos > conta > Socket.IO real.
- Linha do carrinho = (nftId, editionId), com lineId estavel; addCartLine {nftId, editionId, quantity}; PATCH/DELETE por lineId. commerce.ts precisa ser atualizado (hoje sem editionId).
- Hooks de carrinho: useCart, useCartQuote, useCartItemCount, useUpdateCartLine, useRemoveCartLine, useApplyCoupon, useRemoveCoupon, useAddToCart.
- price_changed: diff entre cotacao vista e atual; some ao editar/remover linha, quando o diff zera, ou no reload.
- tokenId '#0042' != edicao (tier limited/open).
- Cupons: LAUNCH10 valido, EXPIRED2025 coupon_expired, outros coupon_invalid.
- Chaves de cache por `viewer` (userId ou id de visitante) para carrinho; orders/wallets por userId. Logout limpa ['cart'],['orders'],['favorites'],['realtime'],['wallets'], jg.checkout.*, jg.idempotency.*.
- Um unico hook de cotacao: useCartQuote({networkId?}). Taxa de rede depende da rede.
- Pedido: idempotencia no hook, chave em sessionStorage; confirmed/refused terminais; recibo = snapshot; polling 1000ms so fallback do order.updated (Socket.IO).
- Cenarios MSW: kebab-case unico (auth-network-error, auth-server-error renomeados).
- Eventos Socket.IO: publicar contrato (nome, version/sequence, eventId) no canal antes da UI consumir.
