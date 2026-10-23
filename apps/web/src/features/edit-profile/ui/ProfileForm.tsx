import { Alert, Button, FormField, Input, LiveRegion, PasswordInput } from '@jg/design-system';
import { useRef, useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { Profile } from '../../../shared/api/contracts/account';
import type { ProfileServerFailure, ServerErrors } from '../model/profile-failure';
import { validateProfileForm, type ProfileFieldName, type ProfileFormErrors, type ProfileFormValues } from '../model/profile-form';
import { AvatarField } from './AvatarField';

export type ProfileFormProps = {
  profile: Profile;
  pending: boolean;
  saved: boolean;
  serverErrors: ServerErrors;
  failure: ProfileServerFailure;
  /** Resolve `true` quando salvou, para limpar os campos de senha. */
  onSubmit: (values: ProfileFormValues, avatarUrl: string | null) => Promise<boolean>;
};

const ORDER: ProfileFieldName[] = ['displayName', 'username', 'email', 'currentPassword', 'newPassword', 'confirmPassword'];

export function ProfileForm({ profile, pending, saved, serverErrors, failure, onSubmit }: ProfileFormProps) {
  const { t } = useTranslation('editProfile');
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<ProfileFormValues>({
    displayName: profile.displayName,
    username: profile.username,
    email: profile.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [clientErrors, setClientErrors] = useState<ProfileFormErrors>({});

  const errorFor = (field: ProfileFieldName) => {
    const code = clientErrors[field] ?? serverErrors[field];
    return code ? t(`errors.${code}`) : undefined;
  };
  const bind = (field: ProfileFieldName) => ({
    name: field,
    value: values[field],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setValues({ ...values, [field]: e.target.value }),
  });
  const password = { showLabel: t('actions.showPassword'), hideLabel: t('actions.hidePassword') };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const errors = validateProfileForm(values);
    setClientErrors(errors);
    const first = ORDER.find((field) => errors[field]);
    if (first) {
      const element = formRef.current?.elements.namedItem(first);
      if (element instanceof HTMLInputElement) element.focus();
      return;
    }
    if (await onSubmit(values, avatarUrl)) {
      setValues((current) => ({ ...current, currentPassword: '', newPassword: '', confirmPassword: '' }));
    }
  };

  return (
    <form ref={formRef} onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-24">
      <AvatarField value={avatarUrl} initial={values.displayName.trim().charAt(0).toUpperCase()} onChange={setAvatarUrl} />
      <div className="grid grid-cols-1 gap-x-28 gap-y-24 tablet:grid-cols-[repeat(2,minmax(0,417px))]">
        <FormField label={t('fields.displayName')} error={errorFor('displayName')}>
          <Input autoComplete="name" {...bind('displayName')} />
        </FormField>
        <FormField label={t('fields.username')} error={errorFor('username')}>
          <Input autoComplete="username" {...bind('username')} />
        </FormField>
        <FormField label={t('fields.email')} error={errorFor('email')}>
          <Input type="email" autoComplete="email" {...bind('email')} />
        </FormField>
        <span aria-hidden="true" className="hidden tablet:block" />
        <FormField label={t('fields.currentPassword')} error={errorFor('currentPassword')}>
          <PasswordInput autoComplete="current-password" {...password} {...bind('currentPassword')} />
        </FormField>
        <span aria-hidden="true" className="hidden tablet:block" />
        <FormField label={t('fields.newPassword')} error={errorFor('newPassword')}>
          <PasswordInput autoComplete="new-password" {...password} {...bind('newPassword')} />
        </FormField>
        <FormField label={t('fields.confirmPassword')} error={errorFor('confirmPassword')}>
          <PasswordInput autoComplete="new-password" {...password} {...bind('confirmPassword')} />
        </FormField>
      </div>
      {failure ? (
        <Alert tone="error" toneLabel="">
          {t(`messages.${failure}`)}
        </Alert>
      ) : null}
      <LiveRegion>{saved ? t('messages.saved') : null}</LiveRegion>
      <Button
        type="submit"
        aria-disabled={pending}
        className="w-131 self-start aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
      >
        {t('actions.save')}
      </Button>
    </form>
  );
}
