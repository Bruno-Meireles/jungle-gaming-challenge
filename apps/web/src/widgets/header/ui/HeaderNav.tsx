import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const ITEM = 'flex h-45 items-start text-body-large-16-regular-lh-16 text-foreground hover:text-text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
const ACTIVE = 'relative text-body-large-16-bold-lh-16 text-text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-2 after:bg-primary';

export function HeaderNav() {
  const { t } = useTranslation('header');
  return (
    <nav aria-label={t('nav.label')} className="hidden tablet:block">
      <ul className="flex items-start gap-24 desktop:gap-40">
        <li>
          <Link to="/" className={ITEM} activeProps={{ className: ACTIVE }} activeOptions={{ exact: true }}>
            {t('nav.home')}
          </Link>
        </li>
        <li>
          <Link to="/" className={ITEM} activeProps={{ className: ITEM }}>
            {t('nav.market')}
          </Link>
        </li>
        <li>
          <Link to="/unavailable" search={{ feature: 'creators' }} className={ITEM}>
            {t('nav.creators')}
          </Link>
        </li>
        <li>
          <Link to="/unavailable" search={{ feature: 'learn' }} className={ITEM}>
            {t('nav.learn')}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
