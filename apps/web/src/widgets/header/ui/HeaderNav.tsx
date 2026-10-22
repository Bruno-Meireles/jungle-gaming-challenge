import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

/* Line-height 21,1 px: Figma I70522:3240;70504:3015;70486:513/515 (docs/figma/file.json:321, 584). */
const ITEM = 'flex h-45 items-start leading-[21.1015625px] hover:text-text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
const INACTIVE = 'text-body-large-16-regular-lh-auto text-foreground';
const ACTIVE = 'relative text-body-large-16-bold-lh-auto text-text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-primary';
const ITEM_ACTIVE = `${ITEM} ${ACTIVE}`;
const ITEM_INACTIVE = `${ITEM} ${INACTIVE}`;

export function HeaderNav() {
  const { t } = useTranslation('header');
  return (
    <nav aria-label={t('nav.label')} className="hidden tablet:block">
      <ul className="flex items-start gap-24 desktop:gap-40">
        <li>
          <Link
            to="/"
            className={ITEM}
            activeProps={{ className: ITEM_ACTIVE }}
            inactiveProps={{ className: ITEM_INACTIVE }}
            activeOptions={{ exact: true }}
          >
            {t('nav.home')}
          </Link>
        </li>
        <li>
          <Link
            to="/"
            className={ITEM_INACTIVE}
            activeProps={{ className: ITEM_INACTIVE }}
          >
            {t('nav.market')}
          </Link>
        </li>
        <li>
          <Link to="/unavailable" search={{ feature: 'creators' }} className={ITEM_INACTIVE}>
            {t('nav.creators')}
          </Link>
        </li>
        <li>
          <Link to="/unavailable" search={{ feature: 'learn' }} className={ITEM_INACTIVE}>
            {t('nav.learn')}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
