import type {
  CartLineInput,
  CartLineViewModel,
  CartQuoteInput,
  QuoteLineInput,
} from '../../src/pages/cart/model/cart-input';

export function cartLine(overrides: Partial<CartLineInput> = {}): CartLineInput {
  return {
    lineId: 'line-1',
    nftId: 'cosmic-bloom-118',
    title: 'Cosmic Bloom #118',
    image: { src: '/img/cosmic-bloom.png', width: 212, height: 212 },
    tokenId: '#0042',
    edition: { id: 'ed-limited', number: 3, supply: 10 },
    unitPrice: '1.29',
    quantity: 2,
    maxQuantity: 5,
    ...overrides,
  };
}

export function quoteLine(overrides: Partial<QuoteLineInput> = {}): QuoteLineInput {
  return { lineId: 'line-1', unitPrice: '1.29', quantity: 2, lineTotal: '2.58', notice: null, ...overrides };
}

export function cartQuote(overrides: Partial<CartQuoteInput> = {}): CartQuoteInput {
  return {
    quoteId: 'q-1',
    cartVersion: 4,
    lines: [quoteLine()],
    subtotal: '26.83',
    discount: '0',
    networkFee: '0.016',
    total: '26.846',
    coupon: null,
    expiresAt: 1_900_000_000_000,
    ...overrides,
  };
}

export function lineViewModel(overrides: Partial<CartLineViewModel> = {}): CartLineViewModel {
  return {
    lineId: 'line-1',
    title: 'Cosmic Bloom #118',
    href: '/nfts/cosmic-bloom-118',
    image: { src: '/img/cosmic-bloom.png', alt: 'Arte Cosmic Bloom #118' },
    tokenLabel: '#0042',
    editionLabel: 'Edicao 3/10',
    unitPriceLabel: '1,29 ETH',
    lineTotalLabel: '2,58 ETH',
    quantity: 2,
    min: 1,
    max: 5,
    canIncrement: true,
    notice: null,
    blocking: false,
    ...overrides,
  };
}

/**
 * `t` falso e deterministico para testar view models sem i18n: devolve `chave(k=v,...)` com opcoes ordenadas.
 * As chaves usadas pelos view models fazem parte do contrato (ver testes).
 */
export function fakeT(key: string, options: Record<string, string | number> = {}): string {
  const args = Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(',');
  return `${key}(${args})`;
}
