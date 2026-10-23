import { useTranslation } from 'react-i18next';

import { NftCardView, useCatalogQuery } from '../../../entities/nft';

/** "Voce tambem pode gostar": populares fora do carrinho; so a partir de 768 px. */
export function RelatedNfts({ excludeNftIds = [] }: { excludeNftIds?: readonly string[] }) {
  const { t } = useTranslation('relatedNfts');
  const { data } = useCatalogQuery({ sort: 'popular' });
  const items = (data?.items ?? []).filter((nft) => !excludeNftIds.includes(nft.id)).slice(0, 5);
  if (items.length === 0) return null;
  return (
    <section aria-label={t('title')} className="hidden flex-col gap-16 tablet:flex">
      <h2 className="text-heading-20-bold text-foreground">{t('title')}</h2>
      <ul className="m-0 grid list-none grid-cols-3 gap-16 p-0 desktop:grid-cols-5">
        {items.map((nft) => (
          <li key={nft.id}>
            <NftCardView nft={nft} />
          </li>
        ))}
      </ul>
    </section>
  );
}
