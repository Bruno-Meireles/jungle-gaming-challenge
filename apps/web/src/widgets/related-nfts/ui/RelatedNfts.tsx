import { useTranslation } from 'react-i18next';

import type { CollectionId } from '../../../shared/api/contracts/ids';
import { NftCardView, useCatalogQuery } from '../../../entities/nft';

/** "Voce tambem pode gostar": populares fora do carrinho; so a partir de 768 px. */
export type RelatedNftsProps = {
  variant?: 'popular' | 'collection' | 'viewed';
  excludeNftIds?: readonly string[];
  collectionId?: CollectionId | undefined;
};

export function RelatedNfts({ variant = 'popular', excludeNftIds = [], collectionId }: RelatedNftsProps) {
  const { t } = useTranslation('relatedNfts');
  const { data } = useCatalogQuery({ sort: 'popular', ...(collectionId ? { collections: [collectionId] } : {}) });
  const items = (data?.items ?? []).filter((nft) => !excludeNftIds.includes(nft.id)).slice(0, 5);
  if (items.length === 0) return null;
  return (
    <section aria-label={t(variant)} className="hidden flex-col gap-16 tablet:flex">
      <h2 className="border-b border-solid border-primary/30 pb-8 text-body-large-17-bold text-text-accent">{t(variant)}</h2>
      <ul className="m-0 grid list-none grid-cols-3 gap-16 p-0 desktop:grid-cols-5 desktop:gap-x-26">
        {items.map((nft) => (
          <li key={nft.id}>
            <NftCardView nft={nft} />
          </li>
        ))}
      </ul>
    </section>
  );
}
