import { DEFAULT_EDITION_ID, seedEditions } from './editions';
import { readCommerce, updateCommerce } from './commerce-state';

export type LiveEdition = {
  id: string;
  label: string;
  supply: number | null;
  priceEth: string;
  remaining: number;
  maxPerOrder: number;
};

export function liveEditions(nftId: string): LiveEdition[] {
  const overrides = readCommerce().market[nftId] ?? {};
  return seedEditions(nftId).map((e) => ({ ...e, ...(overrides[e.id] ?? {}) }));
}

export function liveEdition(nftId: string, editionId: string): LiveEdition | undefined {
  return liveEditions(nftId).find((e) => e.id === editionId);
}

export function nftVersion(nftId: string): number {
  return readCommerce().nftVersions[nftId] ?? 0;
}

/** Preco exibido no catalogo: o da edicao padrao. */
export function livePrice(nftId: string): string | undefined {
  return (liveEdition(nftId, DEFAULT_EDITION_ID) ?? liveEditions(nftId)[0])?.priceEth;
}

/** Altera preco/estoque de uma edicao e incrementa a versao do NFT. */
export function setEdition(
  nftId: string,
  editionId: string,
  patch: { priceEth?: string; remaining?: number },
): number {
  const current = liveEdition(nftId, editionId);
  if (!current) throw new Error('edition_not_found');
  return updateCommerce((s) => {
    const forNft = (s.market[nftId] ??= {});
    forNft[editionId] = {
      priceEth: patch.priceEth ?? current.priceEth,
      remaining: patch.remaining ?? current.remaining,
    };
    s.nftVersions[nftId] = (s.nftVersions[nftId] ?? 0) + 1;
    return s.nftVersions[nftId];
  });
}
