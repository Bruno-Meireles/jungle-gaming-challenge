import { Button, FormField, Input } from '@jg/design-system';
import { useId, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { validateNewsletterEmail, type NewsletterError } from '../model/newsletter';

/** Newsletter fora do escopo funcional: valida o e-mail e informa, sem aparentar sucesso, que ainda nao esta disponivel. */
export function FooterNewsletter() {
  const { t } = useTranslation('footer');
  const inputId = useId();
  const errorId = `${inputId}-error`;
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
      <form
        noValidate
        onSubmit={submit}
        className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_40px] gap-8"
      >
        <div className="col-start-1 row-span-2 min-w-0">
          <FormField label={t('newsletter.label')}>
            <Input
              id={inputId}
              type="email"
              autoComplete="email"
              placeholder={t('newsletter.placeholder')}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>
        </div>
        <Button type="submit" className="col-start-2 row-start-2 self-start shrink-0">
          {t('newsletter.submit')}
        </Button>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="col-span-2 row-start-3 text-body-14-regular-lh-16 text-text-coral"
          >
            {t(`newsletter.${error}`)}
          </p>
        ) : null}
      </form>
      <p className="text-body-14-regular-lh-22 text-text-secondary">{t('newsletter.body')}</p>
      <div role="status" aria-live="polite" className="text-body-14-regular-lh-16 text-text-secondary">
        {notice ? t('newsletter.unavailable') : null}
      </div>
    </section>
  );
}
