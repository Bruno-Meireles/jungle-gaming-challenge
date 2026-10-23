import type { QueryClient } from '@tanstack/react-query';

import { cartKeys, type Cart } from '../../entities/cart';
import {
  nftKeys,
  type CatalogPage,
  type Highlights,
  type NftDetail,
  type NftSummary,
} from '../../entities/nft';
import { isTerminalStatus, orderKeys, type Order } from '../../entities/order';
import {
  type NftUpdatedEvent,
  type OrderUpdatedEvent,
  type RealtimeEvent,
} from '../../shared/api/contracts/realtime';
import { asEthAmount } from '../../shared/lib/eth/eth';

function updateSummary(nft: NftSummary, event: NftUpdatedEvent): NftSummary {
  return nft.id === event.resource.id ? { ...nft, price: asEthAmount(event.data.priceEth) } : nft;
}

function updateCatalog(page: CatalogPage, event: NftUpdatedEvent): CatalogPage {
  return { ...page, items: page.items.map((nft) => updateSummary(nft, event)) };
}

function updateHighlights(highlights: Highlights, event: NftUpdatedEvent): Highlights {
  return {
    ...highlights,
    hero: highlights.hero.map((nft) => updateSummary(nft, event)),
    featured: updateSummary(highlights.featured, event),
  };
}

function updateDetail(detail: NftDetail, event: NftUpdatedEvent): NftDetail {
  if (detail.id !== event.resource.id) return detail;
  const changedEditions = new Map(event.data.editions.map((edition) => [edition.id, edition]));
  return {
    ...detail,
    editions: detail.editions.map((edition) => {
      const changed = changedEditions.get(edition.id);
      return changed
        ? { ...edition, priceEth: changed.priceEth, remaining: changed.remaining }
        : edition;
    }),
  };
}

function updateCart(cart: Cart, event: NftUpdatedEvent): Cart {
  const nftEditions = new Map(event.data.editions.map((edition) => [edition.id, edition]));
  return {
    ...cart,
    lines: cart.lines.map((line) => {
      if (line.nftId !== event.resource.id) return line;
      const changed = nftEditions.get(line.edition.id);
      return changed ? { ...line, unitPrice: asEthAmount(changed.priceEth) } : line;
    }),
  };
}

function applyNftEvent(queryClient: QueryClient, event: NftUpdatedEvent): void {
  for (const [queryKey, page] of queryClient.getQueriesData<CatalogPage>({
    queryKey: ['nfts', 'list'],
  })) {
    if (page) queryClient.setQueryData(queryKey, updateCatalog(page, event));
  }
  for (const [queryKey, highlights] of queryClient.getQueriesData<Highlights>({
    queryKey: ['nfts', 'highlights'],
  })) {
    if (highlights) queryClient.setQueryData(queryKey, updateHighlights(highlights, event));
  }

  const detailKey = nftKeys.detail(event.resource.id);
  const detail = queryClient.getQueryData<NftDetail>(detailKey);
  if (detail) queryClient.setQueryData(detailKey, updateDetail(detail, event));

  for (const [queryKey, cart] of queryClient.getQueriesData<Cart>({ queryKey: cartKeys.all })) {
    if (cart) queryClient.setQueryData(queryKey, updateCart(cart, event));
  }
  void queryClient.invalidateQueries({ queryKey: ['cart', 'quote'] });
}

function applyOrderEvent(queryClient: QueryClient, userId: string, event: OrderUpdatedEvent): void {
  if (event.userId !== userId) return;
  const queryKey = orderKeys.detail(event.resource.id);
  queryClient.setQueryData<Order>(queryKey, (known) => {
    if (!known || isTerminalStatus(known.status) || event.version <= known.version) return known;
    return {
      ...known,
      status: event.data.status,
      version: event.version,
      updatedAt: event.occurredAt,
      transactionRef: event.data.transactionRef,
    };
  });
  void queryClient.invalidateQueries({ queryKey });
}

export function applyRealtimeEvent(
  queryClient: QueryClient,
  userId: string,
  event: RealtimeEvent,
): void {
  if (event.type === 'nft.updated') applyNftEvent(queryClient, event);
  else applyOrderEvent(queryClient, userId, event);
}

export function reconcileRealtimeQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ['nfts'] });
  void queryClient.invalidateQueries({ queryKey: cartKeys.all });
  void queryClient.invalidateQueries({ queryKey: orderKeys.all });
}
