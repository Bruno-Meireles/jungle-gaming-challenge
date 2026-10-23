import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LoginForm, type LoginFormProps, type LoginFormValues } from '../../../features/auth';
import { useDocumentMeta } from '../../../shared/hooks';
import { AuthSurface } from '../../../widgets/auth-surface';

export type LoginPageProps = {
  controller: {
    submit: (values: LoginFormValues) => void;
    pending: boolean;
    failure: LoginFormProps['failure'];
    fieldErrors?: LoginFormProps['fieldErrors'];
    retry: () => void;
  };
  onDismiss: () => void;
  redirect?: string | undefined;
};

export function LoginPage({ controller, onDismiss, redirect }: LoginPageProps) {
  const { t } = useTranslation('pageLogin');
  useDocumentMeta({ title: t('title'), description: t('description') });
  return (
    <AuthSurface
      title={t('heading')}
      subtitle={t('subtitle')}
      onDismiss={onDismiss}
      footer={
        <>
          <span>{t('footer')} </span>
          <Link to="/signup" search={redirect ? { redirect } : {}} className="text-text-accent">
            {t('toggle')}
          </Link>
        </>
      }
    >
      <LoginForm
        onSubmit={controller.submit}
        pending={controller.pending}
        failure={controller.failure}
        fieldErrors={controller.fieldErrors}
        onRetry={controller.retry}
      />
    </AuthSurface>
  );
}
