import { Alert, Button, Rating, Skeleton } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { resolveEdition, type NftDetail } from '../../../entities/nft';
import type { AddToCartController } from '../../../features/add-to-cart';
import type { FavoriteButtonProps } from '../../../features/toggle-favorite';
import { useDocumentMeta, useLocale } from '../../../shared/hooks';
import { COLLECTION_IDS } from '../../../shared/api/contracts/ids';
import { BackButton, PageBreadcrumb, PageContainer } from '../../../shared/ui';
import { RelatedNfts } from '../../../widgets/related-nfts';
import { NftGallery } from '../../../widgets/nft-gallery';
import { NftInfoTabs } from '../../../widgets/nft-info-tabs';
import { NftPurchasePanel } from '../../../widgets/nft-purchase-panel';
import type { NftDetailSearch } from '../model/nft-detail-search';

export type NftDetailResult =
  | { status: 'pending' }
  | { status: 'error' }
  | { status: 'not-found' }
  | { status: 'success'; nft: NftDetail };

export type NftDetailPageProps = {
  result: NftDetailResult;
  search: NftDetailSearch;
  onRetry: () => void;
  onEditionChange: (editionId: string) => void;
  onTabChange: (tab: NftDetailSearch['tab']) => void;
  addToCart: AddToCartController;
  favorite: FavoriteButtonProps;
};

function PendingView() {
  const { t } = useTranslation('pageNftDetail');
  return (
    <section aria-label={t('loading')} aria-busy="true" className="grid gap-24 desktop:grid-cols-2 desktop:gap-48">
      <Skeleton className="aspect-square w-full rounded-22" />
      <div className="flex flex-col gap-16">
        <Skeleton className="h-40 w-3/4 rounded-8" />
        <Skeleton className="h-24 w-1/3 rounded-8" />
        <Skeleton className="h-200 w-full rounded-8" />
      </div>
    </section>
  );
}

function ErrorView({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation('pageNftDetail');
  return (
    <div className="flex flex-col items-start gap-8">
      <Alert tone="error" toneLabel="">
        {t('error')}
      </Alert>
      <Button variant="outline" onClick={onRetry}>
        {t('retry')}
      </Button>
    </div>
  );
}

function NotFoundView() {
  const { t } = useTranslation('pageNftDetail');
  return (
    <div className="flex flex-col items-start gap-16 py-48">
      <h1 className="text-heading-24-bold text-foreground">{t('notFound')}</h1>
      <Button asChild variant="outline">
        <Link to="/">{t('home')}</Link>
      </Button>
    </div>
  );
}

function DetailView({ nft, props }: { nft: NftDetail; props: NftDetailPageProps }) {
  const { t } = useTranslation(['nftInfoTabs', 'pageNftDetail']);
  const locale = useLocale();
  const { edition } = resolveEdition(nft.editions, nft.defaultEditionId, props.search.edition);
  const average = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(nft.rating.average);
  const collectionId = COLLECTION_IDS.find((id) => id === nft.collectionId);
  return (
    <>
      <BackButton label={t('pageNftDetail:back')} />
      <PageBreadcrumb label={t('pageNftDetail:breadcrumb')} items={[{ label: t('pageNftDetail:crumbHome'), to: '/' }, { label: nft.title }]} />
    <div className="grid gap-24 desktop:grid-cols-2 desktop:gap-48">
      <NftGallery title={nft.title} images={nft.gallery} />
      <div className="flex flex-col gap-24">
        <header className="flex flex-col gap-8">
          <h1 className="text-heading-24-bold text-foreground">{nft.title}</h1>
          <p className="text-body-14-regular-lh-16 text-text-secondary">{nft.tokenId}</p>
          <Rating value={nft.rating.average} max={5} label={t('ratingLabel', { average })} />
        </header>
        <NftPurchasePanel
          nftId={nft.id}
          editions={nft.editions}
          selectedEditionId={edition.id}
          onSelectEdition={props.onEditionChange}
          addToCart={props.addToCart}
          favorite={props.favorite}
        />
        <NftInfoTabs nft={nft} tab={props.search.tab} onTabChange={props.onTabChange} />
      </div>
    </div>
      <div className="mt-48">
        <RelatedNfts variant="collection" excludeNftIds={[nft.id]} collectionId={collectionId} />
      </div>
    </>
  );
}

export function NftDetailPage(props: NftDetailPageProps) {
  const { t } = useTranslation('pageNftDetail');
  const { result } = props;
  const name = result.status === 'success' ? result.nft.title : t('fallbackName');
  useDocumentMeta({ title: t('title', { title: name }), description: t('description', { title: name }) });
  return (
    <PageContainer className="pt-16 pb-24 tablet:pt-32 tablet:pb-32">
      {result.status === 'pending' ? <PendingView /> : null}
      {result.status === 'error' ? <ErrorView onRetry={props.onRetry} /> : null}
      {result.status === 'not-found' ? <NotFoundView /> : null}
      {result.status === 'success' ? <DetailView nft={result.nft} props={props} /> : null}
    </PageContainer>
  );
}
