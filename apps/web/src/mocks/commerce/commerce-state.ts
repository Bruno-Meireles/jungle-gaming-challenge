export const COMMERCE_STATE_KEY = 'jg:mocks:commerce';

export type StoredLine = { lineId: string; nftId: string; editionId: string; quantity: number };
export type StoredCart = { lines: StoredLine[]; couponCode: string | null; version: number };
export type StoredEdition = { priceEth: string; remaining: number };
export type StoredOrder = {
  dto: unknown;
  ownerId: string;
  fingerprint: string;
  key: string;
  reads: number;
  settle: 'confirmed' | 'refused' | 'never';
  cartLines: { lineId: string; quantity: number }[];
};

export type CommerceState = {
  carts: Record<string, StoredCart>;
  favorites: Record<string, { nftIds: string[]; version: number }>;
  market: Record<string, Record<string, StoredEdition>>;
  nftVersions: Record<string, number>;
  orders: Record<string, StoredOrder>;
  orderSeq: number;
  counters: Record<string, number>;
};

const empty = (): CommerceState => ({
  carts: {},
  favorites: {},
  market: {},
  nftVersions: {},
  orders: {},
  orderSeq: 0,
  counters: {},
});

let fallback: CommerceState | null = null;

function store(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function isState(value: unknown): value is CommerceState {
  return typeof value === 'object' && value !== null && 'carts' in value && 'orders' in value && 'market' in value;
}

export function readCommerce(): CommerceState {
  const s = store();
  if (!s) return (fallback ??= empty());
  try {
    const parsed: unknown = JSON.parse(s.getItem(COMMERCE_STATE_KEY) ?? 'null');
    if (isState(parsed)) return parsed;
  } catch {
    // estado corrompido: recomeca do estado conhecido
  }
  return empty();
}

export function updateCommerce<T>(mutate: (draft: CommerceState) => T): T {
  const draft = readCommerce();
  const result = mutate(draft);
  const s = store();
  if (s) s.setItem(COMMERCE_STATE_KEY, JSON.stringify(draft));
  else fallback = draft;
  return result;
}

export function resetCommerceState(): void {
  fallback = null;
  store()?.removeItem(COMMERCE_STATE_KEY);
}
