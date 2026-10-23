import { Button, FormField, Input, PasswordInput } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FailureAlert } from './FailureAlert';
import type { FieldErrorCode, FormFailure } from './form-types';
import { SocialButtons } from './SocialButtons';

export type LoginFormValues = { email: string; password: string };

export type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void;
  pending: boolean;
  failure: FormFailure;
  fieldErrors?: Partial<Record<keyof LoginFormValues, FieldErrorCode>>;
  onRetry?: () => void;
};

export function LoginForm({ onSubmit, pending, failure, fieldErrors = {}, onRetry }: LoginFormProps) {
  const { t } = useTranslation('auth');
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const error = (code?: FieldErrorCode) => (code ? t(`errors.field.${code}`) : undefined);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pending) onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-16">
      <FormField label={t('fields.email')} error={error(fieldErrors.email)}>
        <Input
          className="h-50 rounded-10 tablet:h-40 tablet:rounded-5"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
        />
      </FormField>
      <FormField label={t('fields.password')} error={error(fieldErrors.password)}>
        <PasswordInput
          className="h-50 rounded-10 tablet:h-40 tablet:rounded-5"
          autoComplete="current-password"
          showLabel={t('actions.showPassword')}
          hideLabel={t('actions.hidePassword')}
          value={values.password}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
        />
      </FormField>
      <Link
        to="/unavailable"
        search={{ feature: 'forgot-password' }}
        className="self-start text-body-14-regular-lh-16 text-text-accent"
      >
        {t('actions.forgot')}
      </Link>
      {failure && failure.kind !== 'account_conflict' ? (
        <FailureAlert message={failure.kind} onRetry={onRetry} />
      ) : null}
      <Button type="submit" size="block" loading={pending} className="h-60 rounded-10 text-body-large-16-bold-lh-20 tablet:h-40 tablet:rounded-3 tablet:text-body-15-bold-lh-16">
        {t('actions.login')}
      </Button>
      <SocialButtons />
    </form>
  );
}
