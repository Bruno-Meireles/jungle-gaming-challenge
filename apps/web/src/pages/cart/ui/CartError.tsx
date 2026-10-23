import { Alert, Button } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

export function CartError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation('pageCart');
  return (
    <div className="flex flex-col items-start gap-16 py-32">
      <Alert tone="error" toneLabel="">
        {t('error.body')}
      </Alert>
      <Button variant="outline" onClick={onRetry}>
        {t('error.retry')}
      </Button>
    </div>
  );
}
