import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const LINK = 'text-body-14-regular-lh-22 text-text-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus';
const TITLE = 'text-body-large-18-bold-lh-24 text-foreground';

const ACCOUNT = [
  { key: 'collection', feature: 'downloads' },
  { key: 'activity', feature: 'activity' },
  { key: 'studio', feature: 'creators' },
  { key: 'watchlist', feature: 'watchlist' },
] as const;
const HELP = ['buying', 'security', 'policy', 'report'] as const;
const COLLECTIONS = ['digital-art', 'photography', 'music', '3d-art', 'utility'] as const;
const SOCIAL = ['instagram', 'x', 'discord', 'youtube'] as const;

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-12">
      <h2 className={TITLE}>{title}</h2>
      <ul className="m-0 flex list-none flex-col gap-8 p-0">{children}</ul>
    </section>
  );
}

export function FooterLinks() {
  const { t } = useTranslation('footer');
  return (
    <div className="grid grid-cols-2 gap-24 bg-surface-card p-24 desktop:grid-cols-4 desktop:px-32">
      <Column title={t('columns.account.title')}>
        <li>
          <Link to="/account/profile" className={LINK}>
            {t('columns.account.profile')}
          </Link>
        </li>
        {ACCOUNT.map(({ key, feature }) => (
          <li key={key}>
            <Link to="/unavailable" search={{ feature }} className={LINK}>
              {t(`columns.account.${key}`)}
            </Link>
          </li>
        ))}
      </Column>
      <Column title={t('columns.help.title')}>
        {HELP.map((key) => (
          <li key={key}>
            <Link to="/unavailable" search={{ feature: 'support' }} className={LINK}>
              {t(`columns.help.${key}`)}
            </Link>
          </li>
        ))}
      </Column>
      <Column title={t('columns.collections.title')}>
        {COLLECTIONS.map((id) => (
          <li key={id}>
            <Link to="/" search={{ collections: [id] }} className={LINK}>
              {t(`columns.collections.${id}`)}
            </Link>
          </li>
        ))}
      </Column>
      <div className="flex flex-col gap-24">
        <Column title={t('columns.social.title')}>
          {SOCIAL.map((key) => (
            <li key={key}>
              <Link to="/unavailable" search={{ feature: 'social' }} className={LINK}>
                {t(`columns.social.${key}`)}
              </Link>
            </li>
          ))}
        </Column>
        <section className="flex flex-col gap-8">
          <h2 className={TITLE}>{t('wallets.title')}</h2>
          <p className="text-tiny-9-bold text-text-secondary">{t('wallets.brands')}</p>
        </section>
      </div>
    </div>
  );
}
