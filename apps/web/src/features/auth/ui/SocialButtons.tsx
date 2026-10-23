import { Button, Separator } from '@jg/design-system';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

const PROVIDERS = ['Google', 'Facebook'] as const;

export function SocialButtons() {
  const { t } = useTranslation('auth');
  const noteId = useId();
  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center gap-12">
        <Separator className="flex-1" />
        <span className="text-body-14-regular-lh-16 text-secondary">{t('social.divider')}</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex gap-12">
        {PROVIDERS.map((provider) => (
          <Button
            key={provider}
            variant="outline"
            aria-disabled="true"
            aria-describedby={noteId}
            onClick={(event) => event.preventDefault()}
            className="flex-1"
          >
            {provider}
          </Button>
        ))}
      </div>
      <p id={noteId} className="text-body-14-regular-lh-16 text-secondary">
        {t('social.unavailable')}
      </p>
    </div>
  );
}
