import { Button } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function CartEmpty() {
  const { t } = useTranslation('pageCart');
  return (
    <div className="flex flex-col items-start gap-16 py-32">
      <p className="text-body-15-regular-lh-16 text-foreground">{t('empty.body')}</p>
      <Button asChild>
        <Link to="/">{t('empty.cta')}</Link>
      </Button>
    </div>
  );
}
