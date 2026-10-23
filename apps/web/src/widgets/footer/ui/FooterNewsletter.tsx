import { Button, FormField, Input } from '@jg/design-system';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { validateNewsletterEmail, type NewsletterError } from '../model/newsletter';

/** Newsletter fora do escopo funcional: valida o e-mail e informa, sem aparentar sucesso, que ainda nao esta disponivel. */
export function FooterNewsletter() {
  const { t } = useTranslation('footer');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<NewsletterError | null>(null);
  const [notice, setNotice] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateNewsletterEmail(email);
    setError(found);
    setNotice(found === null);
  };

  return (
    <section className="flex flex-col gap-12 desktop:pl-16">
      <h2 className="text-body-large-18-bold-lh-24 text-foreground">{t('newsletter.title')}</h2>
      <form noValidate onSubmit={submit} className="flex items-start gap-8">
        <div className="min-w-0 flex-1">
          <FormField label={t('newsletter.label')} error={error ? t(`newsletter.${error}`) : undefined}>
            <Input
              type="email"
              autoComplete="email"
              placeholder={t('newsletter.placeholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>
        </div>
        <Button type="submit" className="mt-24 shrink-0">
          {t('newsletter.submit')}
        </Button>
      </form>
      <p className="text-body-14-regular-lh-22 text-text-secondary">{t('newsletter.body')}</p>
      <div role="status" aria-live="polite" className="text-body-14-regular-lh-16 text-text-secondary">
        {notice ? t('newsletter.unavailable') : null}
      </div>
    </section>
  );
}
