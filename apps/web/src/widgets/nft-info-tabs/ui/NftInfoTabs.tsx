import { Rating, Tabs, TabsContent, TabsList, TabsTrigger } from '@jg/design-system';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { pickLocalized, shortAddress, type NftDetail } from '../../../entities/nft';
import { useLocale } from '../../../shared/hooks';

export type InfoTab = 'details' | 'reviews';

export type NftInfoTabsProps = {
  nft: NftDetail;
  tab: InfoTab;
  onTabChange: (tab: InfoTab) => void;
};

const TABS: readonly InfoTab[] = ['details', 'reviews'];
const TERM = 'mt-12 text-foreground first:mt-0';
const LIST = 'max-w-full flex-wrap gap-x-16 desktop:flex-nowrap desktop:gap-32 desktop:border-b desktop:border-primary/30';
const TRIGGER =
  'desktop:h-28 desktop:text-body-large-17-regular-lh-16 desktop:data-[state=active]:text-body-large-17-bold desktop:after:top-27 desktop:after:h-3';

function isInfoTab(value: string): value is InfoTab {
  return TABS.some((tab) => tab === value);
}

function DetailsPanel({ nft }: { nft: NftDetail }) {
  const { t } = useTranslation('nftInfoTabs');
  const locale = useLocale();
  const paragraphs = pickLocalized(nft.description, locale).split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-12 text-body-14-regular-lh-24 text-text-secondary">
      <div className="flex flex-col gap-24">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p>{t('ownership')}</p>
      </div>
      {nft.attributes.length > 0 ? (
        <section aria-label={t('attributes')} className="desktop:hidden">
          <ul className="flex flex-wrap gap-8">
            {nft.attributes.map((attribute) => (
              <li key={attribute.name.en} className="rounded-8 border border-secondary px-12 py-8 text-body-14-regular-lh-16">
                <span className="text-text-secondary">{pickLocalized(attribute.name, locale)}</span>{' '}
                <span className="text-foreground">{pickLocalized(attribute.value, locale)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <dl>
        <dt className={TERM}>{t('network')}</dt>
        <dd>{t('networkText')}</dd>
        <dt className={TERM}>{t('contract')}</dt>
        <dd>{t('contractText', { address: shortAddress(nft.contract.address), standard: nft.contract.standard })}</dd>
        <dt className={TERM}>{t('royalties')}</dt>
        <dd>{t('royaltiesText', { percent: nft.royaltyPercent })}</dd>
      </dl>
    </div>
  );
}

function ReviewsPanel({ nft }: { nft: NftDetail }) {
  const { t } = useTranslation('nftInfoTabs');
  const locale = useLocale();
  const average = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(nft.rating.average);
  return (
    <div className="flex items-center gap-12">
      <Rating value={nft.rating.average} max={5} label={t('ratingLabel', { average })} />
      <span className="text-body-14-regular-lh-16 text-foreground">{t('reviewCount', { count: nft.rating.count })}</span>
    </div>
  );
}

export function NftInfoTabs({ nft, tab, onTabChange }: NftInfoTabsProps) {
  const { t } = useTranslation('nftInfoTabs');
  // Radix dispara onValueChange no mousedown e no foco do mesmo clique: emite a troca uma vez por gesto.
  const lastRequested = useRef<InfoTab | null>(null);
  const handleValueChange = (value: string) => {
    if (!isInfoTab(value) || lastRequested.current === value) return;
    lastRequested.current = value;
    setTimeout(() => {
      lastRequested.current = null;
    }, 0);
    onTabChange(value);
  };
  return (
    <Tabs value={tab} onValueChange={handleValueChange}>
      <TabsList aria-label={t('tabsLabel')} className={LIST}>
        {TABS.map((id) => (
          <TabsTrigger key={id} value={id} className={TRIGGER}>
            {t(id, { count: nft.rating.count })}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="details" className="pt-16 desktop:pt-12">
        <DetailsPanel nft={nft} />
      </TabsContent>
      <TabsContent value="reviews" className="pt-16">
        <ReviewsPanel nft={nft} />
      </TabsContent>
    </Tabs>
  );
}
