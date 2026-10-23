import { Button } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const LINK =
  'block whitespace-nowrap rounded-3 px-16 py-12 text-body-15-regular-lh-16 text-foreground aria-[current=page]:bg-surface-raised aria-[current=page]:text-text-accent';
const BUTTON_LINK = `${LINK} h-auto cursor-pointer`;
const UNAVAILABLE = ['activity', 'watchlist', 'offers', 'downloads', 'support'] as const;

export type AccountNavProps = { onLogout: () => void };

export function AccountNav({ onLogout }: AccountNavProps) {
  const { t } = useTranslation('accountNav');
  return (
    <nav aria-label={t('label')} className="desktop:w-310 desktop:shrink-0">
      <ul className="flex gap-8 overflow-x-auto desktop:flex-col desktop:overflow-visible">
        <li>
          <Link to="/account/profile" className={LINK}>
            {t('items.profile')}
          </Link>
        </li>
        <li>
          <Link to="/account/wallets" className={LINK}>
            {t('items.wallets')}
          </Link>
        </li>
        {UNAVAILABLE.map((feature) => (
          <li key={feature}>
            <Link to="/unavailable" search={{ feature }} className={LINK}>
              {t(`items.${feature}`)}
            </Link>
          </li>
        ))}
        <li>
          <Button variant="ghost" onClick={onLogout} className={BUTTON_LINK}>
            {t('logout')}
          </Button>
        </li>
      </ul>
    </nav>
  );
}
