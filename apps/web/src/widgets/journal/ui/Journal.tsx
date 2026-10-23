import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useLocale } from '../../../shared/hooks';
import { JOURNAL_POSTS, type JournalPost } from '../model/posts';

function PostCard({ post, locale }: { post: JournalPost; locale: 'pt-BR' | 'en' }) {
  const { t } = useTranslation('journal');
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(post.publishedAt));
  const title = t(`posts.${post.id}.title`);
  return (
    <article className="flex flex-col overflow-hidden rounded-8 bg-surface-card">
      <img src={post.image} alt="" width={268} height={195} loading="lazy" className="h-195 w-full object-cover" />
      <div className="flex flex-1 flex-col gap-8 p-16">
        <p className="text-caption-12-regular-lh-16 text-text-secondary">{t('meta', { date, minutes: post.minutes })}</p>
        <h3 className="text-body-large-16-bold-lh-20 text-foreground">{title}</h3>
        <p className="text-caption-12-regular-lh-16 text-text-secondary">{t(`posts.${post.id}.summary`)}</p>
        <Link
          to="/unavailable"
          search={{ feature: 'journal' }}
          aria-label={t('readMoreAbout', { title })}
          className="mt-auto flex items-center gap-8 text-caption-12-bold text-text-accent focus-visible:outline-2 focus-visible:outline-focus"
        >
          {t('readMore')}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export function Journal() {
  const { t } = useTranslation('journal');
  const locale = useLocale();
  return (
    <section aria-labelledby="journal-title" className="flex flex-col gap-40">
      <header className="flex flex-col gap-12">
        <h2 id="journal-title" className="text-heading-28-bold text-foreground">
          {t('title')}
        </h2>
        <p className="text-body-14-regular-lh-16 text-text-secondary">{t('subtitle')}</p>
      </header>
      <div className="grid gap-16 tablet:grid-cols-2 desktop:grid-cols-4 desktop:gap-24">
        {JOURNAL_POSTS.map((post) => (
          <PostCard key={post.id} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}
