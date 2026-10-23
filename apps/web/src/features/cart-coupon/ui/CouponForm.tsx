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
        <Input
          className="h-50 rounded-40 bg-surface-card pr-0 tablet:h-40 tablet:rounded-5 tablet:bg-transparent tablet:pr-16"
          endSlot={
            <button
              type="submit"
              disabled={pending}
              className="-my-12 h-50 w-97 cursor-pointer rounded-40 border-0 bg-linear-to-br from-primary/54 to-primary text-body-15-bold-lh-16 text-foreground disabled:cursor-not-allowed disabled:opacity-60 tablet:hidden"
            >
              {t('apply')}
            </button>
          }
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
        />
      </FormField>
      <Button type="submit" variant="outline" loading={pending} className="hidden self-start tablet:inline-flex">
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
