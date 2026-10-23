import { Alert, Button, FormField, Input } from '@jg/design-system';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeCouponInput } from '../model/normalize-coupon-input';

export type CouponFailureKind = 'coupon_invalid' | 'coupon_expired' | 'required' | 'network' | 'unexpected';

export type CouponFormProps = {
  appliedCode: string | null;
  pending: boolean;
  failure: CouponFailureKind | null;
  onApply: (code: string) => void;
  onRemove: () => void;
};

export function CouponForm({ appliedCode, pending, failure, onApply, onRemove }: CouponFormProps) {
  const { t } = useTranslation('cartCoupon');
  const [value, setValue] = useState('');
  const [clientError, setClientError] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = normalizeCouponInput(value);
    if (input.kind === 'required') return setClientError(true);
    setClientError(false);
    onApply(input.code);
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between gap-16">
        <p className="text-body-14-regular-lh-16 text-foreground">{t('applied', { code: appliedCode })}</p>
        <Button variant="outline" disabled={pending} onClick={onRemove}>
          {t('remove')}
        </Button>
      </div>
    );
  }
  const fieldError = clientError
    ? t('failure.required')
    : failure === 'coupon_invalid' || failure === 'coupon_expired'
      ? t(`failure.${failure}`)
      : undefined;
  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-12">
      <FormField label={t('label')} error={fieldError}>
        <Input value={value} onChange={(event) => setValue(event.target.value)} autoComplete="off" />
      </FormField>
      <Button type="submit" variant="outline" loading={pending} className="self-start">
        {t('apply')}
      </Button>
      {failure === 'network' || failure === 'unexpected' ? (
        <Alert tone="error" toneLabel="">
          {t(`failure.${failure}`)}
        </Alert>
      ) : null}
    </form>
  );
}
