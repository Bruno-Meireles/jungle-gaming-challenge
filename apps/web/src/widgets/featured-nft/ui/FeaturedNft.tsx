import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useHighlightsQuery } from '../../../entities/nft';

// So em >= 1440 (plano Q12): fora disso a regiao fica display: none e sai da arvore de acessibilidade.
export function FeaturedNft() {
  const { t } = useTranslation(['featured', 'nft']);
  const { data } = useHighlightsQuery();
  const nft = data?.featured;
  return (
    <section
      aria-label={t('featured:label')}
      className="hidden w-310 self-start rounded-22 bg-linear-to-b from-primary/10 to-primary/3 pt-24 desktop:block"
    >
      <h2 className="px-20 text-heading-24-bold text-text-accent">{t('featured:title')}</h2>
      <p className="mt-16 px-20 text-title-22-bold text-foreground">{t('featured:subtitle')}</p>
      {nft ? (
        <Link
          to="/nfts/$nftId"
          params={{ nftId: nft.id }}
          search={{ tab: 'details' }}
          className="mt-16 block focus-visible:outline-2 focus-visible:outline-focus"
        >
          <img
            src={nft.image.src}
            width={nft.image.width}
            height={nft.image.height}
            alt={t('nft:image.alt', { title: nft.title })}
            className="h-368 w-310 rounded-22 object-cover"
          />
        </Link>
      ) : (
        <div aria-hidden="true" className="mt-16 h-368 w-310" />
      )}
    </section>
  );
}
