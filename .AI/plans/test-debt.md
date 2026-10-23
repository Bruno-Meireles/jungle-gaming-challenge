- nft-detail (F4): testes de integracao MSW (loader/notFound, hooks use-toggle-favorite otimista+rollback, use-add-to-cart 409), medidas Figma (*.measure.test.tsx), MediaGallery do DS e E2E 30-47 de .AI/plans/nft-detail.md; dependem de D1-D5 (docs/agent-communication.md).
- checkout-orders: pendentes DS PriceSummary/LineItemRow (testes 13-14), medidas Figma (21), adaptadores de pagina + E2E 22-31 (.AI/plans/checkout-orders.md s5); RED bloco S ja commitado ed48dc9

## Comercio (cart/orders/favoritos) - sem testes por decisao do usuario
- mocks/handlers/{cart,orders,favorites}.ts: cobrir via MSW node (idempotencia, quote_changed, cupom, merge).
- entities/cart (otimismo/rollback, notices), entities/order (placeOrder retries com a mesma chave), useToggleFavorite.
- Catalogo e highlights projetam `livePrice`; adicionar teste de API que confirme a propagacao de alteracoes do mercado.

- entities/realtime/** + app/realtime/** + mocks/realtime/**: cobrir socket.io-client real via MSW (handshake apos worker.start, identify, nft.updated no catalogo/detalhe/carrinho/cotacao, order.updated privado, dedupe eventId/versao, estado terminal, reconexao/reconciliacao REST, teardown de logout/troca de usuario).
