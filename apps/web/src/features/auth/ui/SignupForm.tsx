import { Button, FormField, Input, PasswordInput } from '@jg/design-system';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FailureAlert } from './FailureAlert';
import type { FieldErrorCode, FormFailure } from './form-types';

export type SignupFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignupFormProps = {
  onSubmit: (values: SignupFormValues) => void;
  pending: boolean;
  failure: FormFailure;
  fieldErrors?: Partial<Record<keyof SignupFormValues, FieldErrorCode>>;
  onRetry?: () => void;
};

const EMPTY: SignupFormValues = { username: '', email: '', password: '', confirmPassword: '' };

export function SignupForm({ onSubmit, pending, failure, fieldErrors = {}, onRetry }: SignupFormProps) {
  const { t } = useTranslation('auth');
  const [values, setValues] = useState<SignupFormValues>(EMPTY);
  const conflicts = failure?.kind === 'account_conflict' ? failure.fields : [];
  const error = (code?: FieldErrorCode) => (code ? t(`errors.field.${code}`) : undefined);
  const set = (key: keyof SignupFormValues) => (e: { target: { value: string } }) =>
    setValues({ ...values, [key]: e.target.value });

  const usernameError = conflicts.includes('username')
    ? t('errors.field.username_taken')
    : error(fieldErrors.username);
  const emailError = conflicts.includes('email') ? t('errors.field.email_taken') : error(fieldErrors.email);
  const showAlert =
    failure !== null &&
    failure.kind !== 'invalid_credentials' &&
    !(failure.kind === 'account_conflict' && conflicts.length > 0);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pending) onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-16">
      <FormField label={t('fields.username')} error={usernameError}>
        <Input autoComplete="username" value={values.username} onChange={set('username')} />
      </FormField>
      <FormField label={t('fields.email')} error={emailError}>
        <Input type="email" autoComplete="email" value={values.email} onChange={set('email')} />
      </FormField>
      <FormField label={t('fields.password')} error={error(fieldErrors.password)}>
        <PasswordInput
          autoComplete="new-password"
          showLabel={t('actions.showPassword')}
          hideLabel={t('actions.hidePassword')}
          value={values.password}
          onChange={set('password')}
        />
      </FormField>
      <FormField label={t('fields.confirmPassword')} error={error(fieldErrors.confirmPassword)}>
        <PasswordInput
          autoComplete="new-password"
          showLabel={t('actions.showPassword')}
          hideLabel={t('actions.hidePassword')}
          value={values.confirmPassword}
          onChange={set('confirmPassword')}
        />
      </FormField>
      {showAlert ? <FailureAlert message={failure.kind} onRetry={onRetry} /> : null}
      <Button type="submit" size="block" loading={pending}>
        {t('actions.signup')}
      </Button>
    </form>
  );
}
