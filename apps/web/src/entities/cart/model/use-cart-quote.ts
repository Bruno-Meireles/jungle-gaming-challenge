import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

import type { NetworkId } from '../../../shared/api/contracts/ids';
import { fetchQuote } from '../api/cart-api';
import { cartKeys } from './cart-keys';
import type { CartQuote } from './domain/cart';
import { withNotices } from './domain/quote';
import { rememberPrices, seenPrices } from './quote-seen';

const DEFAULT_NETWORK: NetworkId = 'ethereum';

async function loadQuote(networkId: NetworkId, signal?: AbortSignal): Promise<CartQuote> {
  const quote = await fetchQuote(networkId, signal);
  const apiNotices = new Map(quote.lines.flatMap((l) => (l.notice ? [[l.lineId, l.notice] as const] : [])));
  const result = withNotices(quote, seenPrices, apiNotices);
  rememberPrices(result.lines);
  return result;
}

/** Cotacao da API: unica fonte de totais. Mantem a anterior durante o recalculo. */
export function useCartQuote(options?: { networkId?: NetworkId }) {
  const networkId = options?.networkId ?? DEFAULT_NETWORK;
  return useQuery({
    queryKey: cartKeys.quote(networkId),
    queryFn: ({ signal }) => loadQuote(networkId, signal),
    placeholderData: keepPreviousData,
  });
}

/** Busca uma cotacao nova (ignora cache) para revalidar antes de confirmar a compra. */
export function useRevalidateQuote() {
  const client = useQueryClient();
  return (networkId: NetworkId = DEFAULT_NETWORK) =>
    client.fetchQuery({ queryKey: cartKeys.quote(networkId), queryFn: () => loadQuote(networkId), staleTime: 0 });
}
