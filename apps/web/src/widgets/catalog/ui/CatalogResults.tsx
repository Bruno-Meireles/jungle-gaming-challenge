import { Alert, Button, LiveRegion, NftCardSkeleton } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { NftCardView, type CatalogQueryResult } from '../../../entities/nft';

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const;
const GRID = 'grid grid-cols-2 gap-x-16 gap-y-24 tablet:gap-x-24 tablet:gap-y-32 desktop:grid-cols-3';

export function CatalogResults({ query }: { query: CatalogQueryResult }) {
  const { t } = useTranslation('catalog');
  const { data } = query;

  if (data === undefined && query.isError) {
    return (
      <Alert
        tone="error"
        toneLabel={t('error.toneLabel')}
        title={t('error.title')}
        action={
          <Button variant="outline" onClick={() => void query.refetch()}>
            {t('error.retry')}
          </Button>
        }
      >
        {t('error.text')}
      </Alert>
    );
  }
  if (data === undefined) {
    return (
      <div aria-busy="true">
        <LiveRegion>{t('loading')}</LiveRegion>
        <div className={GRID}>
          {SKELETON_KEYS.map((key) => (
            <NftCardSkeleton key={key} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div aria-busy={query.isPlaceholderData}>
      <LiveRegion>{t('count', { count: data.totalItems })}</LiveRegion>
      {data.items.length === 0 ? (
        <div>
          <h3>{t('empty.title')}</h3>
          <p>{t('empty.text')}</p>
          <Link to="/" search={{}}>
            {t('empty.clear')}
          </Link>
        </div>
      ) : (
        <ul aria-label={t('listLabel')} className={GRID}>
          {data.items.map((nft) => (
            <li key={nft.id}>
              <NftCardView nft={nft} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
