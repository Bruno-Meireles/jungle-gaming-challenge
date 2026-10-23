import { Button } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const LINK =
  'block whitespace-nowrap rounded-3 px-16 py-12 text-body-15-regular-lh-16 text-foreground aria-[current=page]:bg-surface-raised aria-[current=page]:text-text-accent desktop:flex desktop:h-45 desktop:items-center desktop:rounded-none desktop:border-l-6 desktop:border-transparent desktop:py-0 desktop:aria-[current=page]:border-primary desktop:aria-[current=page]:bg-transparent';
const BUTTON_LINK = `${LINK} h-auto cursor-pointer`;
const LOGOUT = `${BUTTON_LINK} desktop:w-full desktop:h-40 desktop:justify-start desktop:font-bold`;
const UNAVAILABLE = ['activity', 'watchlist', 'offers', 'downloads', 'support'] as const;

export type AccountNavProps = { onLogout: () => void };

export function AccountNav({ onLogout }: AccountNavProps) {
  const { t } = useTranslation('accountNav');
  return (
    <nav aria-label={t('label')} className="desktop:w-310 desktop:shrink-0 desktop:self-start desktop:bg-surface-card desktop:py-8">
      <p aria-hidden="true" className="hidden px-10 py-10 text-body-large-18-bold-lh-16 text-foreground desktop:block">
        {t('label')}
      </p>
      <ul className="flex gap-8 overflow-x-auto desktop:flex-col desktop:gap-0 desktop:overflow-visible">
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
        <li className="desktop:mt-8 desktop:border-t desktop:border-primary/30">
          <Button
            variant="ghost"
            onClick={onLogout}
            className={LOGOUT}
          >
            {t('logout')}
          </Button>
        </li>
      </ul>
    </nav>
  );
}
