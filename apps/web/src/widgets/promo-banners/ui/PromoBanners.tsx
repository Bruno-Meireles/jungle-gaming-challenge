import { Button } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

type Promo = { key: 'genesis' | 'curated'; image: string; tab: 'new' | 'trending'; imageSide: 'left' | 'right' };

// Imagens do mock (desvio: o Figma so tem 4 image fills; ver ADR-22).
const PROMOS: Promo[] = [
  { key: 'genesis', image: '/nfts/neon-vessel-552-480.webp', tab: 'new', imageSide: 'left' },
  { key: 'curated', image: '/nfts/emerald-ape-042-480.webp', tab: 'trending', imageSide: 'left' },
];

function PromoCard({ promo }: { promo: Promo }) {
  const { t } = useTranslation('promoBanners');
  return (
    <article className="relative flex min-h-250 overflow-hidden rounded-8 bg-surface-card">
      <img src={promo.image} alt="" width={292} height={250} loading="lazy" className="hidden h-250 w-292 shrink-0 object-cover tablet:block" />
      <div className="flex flex-1 flex-col items-start justify-between gap-16 p-24 tablet:items-end tablet:text-right">
        <div className="flex flex-col gap-12">
          <h3 className="text-body-large-18-bold-lh-24 text-foreground">{t(`${promo.key}.title`)}</h3>
          <p className="text-body-14-regular-lh-22 text-text-secondary">{t(`${promo.key}.body`)}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/" search={{ tab: promo.tab }}>
            {t('explore')}
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function PromoBanners() {
  const { t } = useTranslation('promoBanners');
  return (
    <section aria-label={t('label')} className="grid gap-16 tablet:grid-cols-2 tablet:gap-28">
      {PROMOS.map((promo) => (
        <PromoCard key={promo.key} promo={promo} />
      ))}
    </section>
  );
}
