import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { SignupForm, type SignupFormProps, type SignupFormValues } from '../../../features/auth';
import { useDocumentMeta } from '../../../shared/hooks';
import { AuthSurface } from '../../../widgets/auth-surface';

export type SignupPageProps = {
  controller: {
    submit: (values: SignupFormValues) => void;
    pending: boolean;
    failure: SignupFormProps['failure'];
    fieldErrors?: SignupFormProps['fieldErrors'];
    retry: () => void;
  };
  onDismiss: () => void;
  redirect?: string | undefined;
};

export function SignupPage({ controller, onDismiss, redirect }: SignupPageProps) {
  const { t } = useTranslation('pageSignup');
  useDocumentMeta({ title: t('title'), description: t('description') });
  return (
    <AuthSurface
      title={t('heading')}
      subtitle={t('subtitle')}
      onDismiss={onDismiss}
      footer={
        <>
          <span>{t('footer')} </span>
          <Link to="/login" search={{ redirect }} className="text-text-accent">
            {t('toggle')}
          </Link>
        </>
      }
    >
      <SignupForm
        onSubmit={controller.submit}
        pending={controller.pending}
        failure={controller.failure}
        fieldErrors={controller.fieldErrors}
        onRetry={controller.retry}
      />
    </AuthSurface>
  );
}
