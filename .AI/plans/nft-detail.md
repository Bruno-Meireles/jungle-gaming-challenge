# Plano: nft-detail (F4)

Autor: architect (condensado). Rota `/nfts/$nftId`, search `edition` e `tab` (details|reviews). Figma 10:244 (desktop) e 15:5536 (mobile).

## Premissas e correcoes
- Camada de negocio (Copilot) ainda incompleta: faltam `GET /api/nfts/:id` (D1), favoritos (D2), `POST /api/cart/items` (D3), `entities/session` (D4), cenarios MSW (D5). Pedidos registrados em `docs/agent-communication.md`. A UI avanca por componentes apresentacionais + dominio puro; E2E ficam verdes quando D1-D5 existirem.
- Correcao: carrinho NAO e privado (prompt.md:86 e :107; routes.md:31). Favoritar exige sessao (redirect para `/login?redirect=`); COMPRAR funciona para visitante.

## Slices (apps/web/src)
- `entities/nft`: `model/domain/{nft-detail,edition-rules,short-address,pick-localized}.ts`, `model/edition-label.ts`, `nft-keys.detail`, index (acrescimos).
- `features/select-edition` (EditionPicker), `features/add-to-cart` (AddToCartButton, controller por props), `features/toggle-favorite` (FavoriteButton, regra de acao com redirect).
- `widgets/nft-gallery`, `widgets/nft-purchase-panel`, `widgets/nft-info-tabs`, `widgets/related-nfts`.
- `pages/nft-detail`: `nftDetailSearchSchema` (zod; tab catch 'details'), `NftDetailPage` apresentacional + Pending/Error/NotFound, locales; rota registrada pelo dono do router.
- DS: `MediaGallery`, variante `ring` no ChipGroupItem (so se necessario).

## Dominio
- `resolveEdition(editions, defaultId, param)`, `isSoldOut`, `maxSelectableQuantity = min(remaining,maxPerOrder)`, `clampQuantity`, `shortAddress`, `pickLocalized`. ETH sempre string decimal.

## Aceite
A1 acesso direto pt-BR/en; A2 404; A3 skeleton aria-busy e erro com retry; A4 edicao na URL (invalida removida); A5 edicao esgotada desabilitada com texto; A6 stepper min 1/max, mensagem no limite; A7 comprar envia {nftId,editionId,quantity}, 409 mostra mensagem; A8 favoritar sem sessao -> login com redirect; A9 favorito otimista com rollback; A10 abas por URL e teclado; A11 relacionados; A13 sem overflow 390, foco, a11y.

## Testes
Vitest node: edition-rules, edition-label, short-address, pick-localized, nft-keys, nft-detail-search. Vitest browser: EditionPicker, FavoriteButton, AddToCartButton, NftPurchasePanel, NftInfoTabs, NftGallery, NftDetailPage (estados), MediaGallery (DS), i18n parity. Integracao MSW (loader, hooks de favorito/carrinho) e E2E 30-47 do architect: dependem de D1-D5 (fase posterior).

## Decisoes
ADR-23 router com contexto queryClient + loader + notFound (feito pelo dono do router); ADR-24 detalhe com `editions[]` e textos `{pt-BR,en}` escolhidos no cliente (idioma fora da queryKey); ADR-25 favoritos otimistas com rollback. Compartilhar -> `/unavailable?feature=share`. Favorito nao e aplicado automaticamente apos login.
