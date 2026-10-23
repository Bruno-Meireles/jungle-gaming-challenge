import { FormField, Input, Textarea } from '@jg/design-system';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { MOBILE_FIELD } from '../../../shared/ui';

import type { CollectorErrors, CollectorField, CollectorValues } from '../model/collector-schema';

export type CollectorFormProps = {
  values: CollectorValues;
  errors: CollectorErrors;
  focusField: CollectorField | null;
  onChange: (field: CollectorField, value: string) => void;
};

/* Asterisco visual dos campos obrigatorios (Figma): pseudo-elemento, para o texto do rotulo seguir exato. */
const REQUIRED_LABEL = '[&_[data-slot=form-field]:has(input[required])>label]:after:ml-2 [&_[data-slot=form-field]:has(input[required])>label]:after:text-title-22-regular [&_[data-slot=form-field]:has(input[required])>label]:after:text-text-coral [&_[data-slot=form-field]:has(input[required])>label]:after:content-["*"]';

const TEXT_FIELDS: { field: CollectorField; required: boolean; type?: 'email'; autoComplete?: string }[] = [
  { field: 'displayName', required: true, autoComplete: 'name' },
  { field: 'email', required: true, type: 'email', autoComplete: 'email' },
  { field: 'username', required: true, autoComplete: 'username' },
  { field: 'profileName', required: true },
  { field: 'referralCode', required: true },
  { field: 'ensName', required: true },
  { field: 'secondaryWalletOrEns', required: false },
];

export function CollectorForm({ values, errors, focusField, onChange }: CollectorFormProps) {
  const { t } = useTranslation('collectorForm');
  const formRef = useRef<HTMLFormElement>(null);
  const errorOf = (field: CollectorField) => {
    const code = errors[field];
    return code ? t(`errors.${code}`) : undefined;
  };

  useEffect(() => {
    if (!focusField) return;
    const el = formRef.current?.elements.namedItem(focusField);
    if (el instanceof HTMLElement) el.focus();
  }, [focusField]);

  return (
    <form ref={formRef} noValidate onSubmit={(e) => e.preventDefault()} className={'flex flex-col gap-16 desktop:grid desktop:grid-cols-2 desktop:gap-x-24 ' + REQUIRED_LABEL}>
      {TEXT_FIELDS.map(({ field, required, type, autoComplete }) => (
        <FormField key={field} label={t(`fields.${field}`)} error={errorOf(field)}>
          <Input
            className={MOBILE_FIELD}
            name={field}
            type={type ?? 'text'}
            autoComplete={autoComplete}
            required={required}
            value={values[field]}
            onChange={(e) => onChange(field, e.target.value)}
          />
        </FormField>
      ))}
      <FormField label={t('fields.note')} error={errorOf('note')}>
        <Textarea name="note" value={values.note} onChange={(e) => onChange('note', e.target.value)} />
      </FormField>
    </form>
  );
}
