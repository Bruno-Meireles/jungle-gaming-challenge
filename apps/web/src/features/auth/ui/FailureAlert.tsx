import { Alert, Button } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

export type FailureAlertProps = {
  message: 'invalid_credentials' | 'account_conflict' | 'network' | 'unexpected';
  onRetry?: () => void;
};

/*
 * O alerta contem so a mensagem (role=alert); a nova tentativa fica fora dele. O tom e comunicado pelo
 * role e pelo icone, por isso o rotulo textual de tom do DS fica vazio (sem texto extra no alerta).
 */
export function FailureAlert({ message, onRetry }: FailureAlertProps) {
  const { t } = useTranslation('auth');
  return (
    <div className="flex flex-col gap-8">
      <Alert tone="error" toneLabel="">
        {t(`errors.${message}`)}
      </Alert>
      {message === 'network' && onRetry ? (
        <Button variant="outline" onClick={onRetry} className="self-start">
          {t('actions.retry')}
        </Button>
      ) : null}
    </div>
  );
}
