import { formatEthAmount } from '../../../shared/lib/eth/format-eth';
import type { NftSummary } from './domain/nft';

export type Translate = (key: string, options?: Record<string, string>) => string;

export type NftCardViewModel = {
  id: string;
  title: string;
  priceLabel: string;
  image: { src: string; alt: string };
  href: string;
  isRare: boolean;
};

export function toCardViewModel(
  nft: NftSummary,
  ctx: { locale: 'pt-BR' | 'en'; t: Translate },
): NftCardViewModel {
  return {
    id: nft.id,
    title: nft.title,
    priceLabel: ctx.t('shared:eth.amount', { amount: formatEthAmount(nft.price, ctx.locale) }),
    image: { src: nft.image.src, alt: ctx.t('nft:image.alt', { title: nft.title }) },
    href: `/nfts/${nft.id}`,
    isRare: nft.rarity === 'rare',
  };
}
