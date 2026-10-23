import { Alert, Button, Checkbox, FormField, Input, Label } from '@jg/design-system';
import { useId, useRef, useState } from 'react';
import type { RefObject, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { Wallet, WalletKind } from '../../../shared/api/contracts/account';
import { toFormFailure, type FormFailure } from '../../../shared/lib/form';
import { useSaveWallet } from '../model/use-save-wallet';
import { toSaveRequest, validateWalletForm, type WalletFormErrors, type WalletFormValues } from '../model/wallet-form';
import { isSameAsPrimary } from '../model/wallet-slots';
import { NetworkSelect } from './NetworkSelect';

export type WalletFormProps = {
  kind: WalletKind;
  wallet: Wallet | null;
  primary?: Wallet | null;
  /** Habilita "Igual a principal" (apenas na secundaria). */
  showSameAsPrimary?: boolean;
  autoFocusNetwork?: boolean;
  onSaved: () => void;
  onSessionExpired: () => void;
};

type Banner = 'network' | 'unexpected' | null;

function bannerOf(failure: FormFailure): Banner {
  if (failure.kind === 'network') return 'network';
  return failure.kind === 'unexpected' ? 'unexpected' : null;
}

function SameAsPrimary({ checked, disabled, onChange }: { checked: boolean; disabled: boolean; onChange: (checked: boolean) => void }) {
  const { t } = useTranslation('manageWallets');
  const id = useId();
  return (
    <div className="flex items-center gap-8">
      <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={(next) => onChange(next === true)} />
      <Label htmlFor={id}>{t('fields.same')}</Label>
    </div>
  );
}

type SubmitDeps = Pick<WalletFormProps, 'kind' | 'onSaved' | 'onSessionExpired'> & {
  values: WalletFormValues;
  addressRef: RefObject<HTMLInputElement | null>;
  setErrors: (errors: WalletFormErrors) => void;
  setBanner: (banner: Banner) => void;
};

function useWalletSubmit({ kind, values, addressRef, setErrors, setBanner, onSaved, onSessionExpired }: SubmitDeps) {
  const save = useSaveWallet();
  return async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (save.isPending) return;
    const found = validateWalletForm(values);
    setErrors(found);
    setBanner(null);
    if (found.address) {
      addressRef.current?.focus();
      return;
    }
    try {
      await save.mutateAsync(toSaveRequest(kind, values));
      onSaved();
    } catch (error) {
      const failure = toFormFailure(error);
      if (failure.kind === 'session_expired') onSessionExpired();
      setErrors(failure.kind === 'validation' ? { address: 'invalid_address' } : {});
      setBanner(bannerOf(failure));
    }
  };
}

function initialValues(wallet: Wallet | null): WalletFormValues {
  return { network: wallet?.network ?? 'ethereum', address: wallet?.address ?? '' };
}

export function WalletForm({
  kind,
  wallet,
  primary = null,
  showSameAsPrimary = false,
  autoFocusNetwork = false,
  onSaved,
  onSessionExpired,
}: WalletFormProps) {
  const { t } = useTranslation('manageWallets');
  const addressRef = useRef<HTMLInputElement>(null);
  const save = useSaveWallet();
  const [values, setValues] = useState<WalletFormValues>(() => initialValues(wallet));
  const [errors, setErrors] = useState<WalletFormErrors>({});
  const [banner, setBanner] = useState<Banner>(null);
  const same = isSameAsPrimary(primary, values) && showSameAsPrimary;

  const toggleSame = (checked: boolean) => {
    setValues(checked && primary ? { network: primary.network, address: primary.address } : { ...values, address: '' });
    setErrors({});
  };

  const handleSubmit = useWalletSubmit({ kind, values, addressRef, setErrors, setBanner, onSaved, onSessionExpired });

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-24">
      <div className="flex max-w-417 flex-col gap-24">
        <NetworkSelect
          value={values.network}
          disabled={same}
          autoFocus={autoFocusNetwork}
          onChange={(network) => setValues({ ...values, network })}
        />
        <FormField label={t('fields.address')} error={errors.address ? t(`errors.${errors.address}`) : undefined}>
          <Input
            ref={addressRef}
            autoComplete="off"
            spellCheck={false}
            disabled={same}
            value={values.address}
            onChange={(e) => setValues({ ...values, address: e.target.value })}
          />
        </FormField>
        {showSameAsPrimary ? <SameAsPrimary checked={same} disabled={primary === null} onChange={toggleSame} /> : null}
      </div>
      {banner ? (
        <Alert tone="error" toneLabel="">
          {t(`messages.${banner}`)}
        </Alert>
      ) : null}
      <Button
        type="submit"
        aria-disabled={save.isPending}
        className="w-131 self-start aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
      >
        {t('actions.save')}
      </Button>
    </form>
  );
}
