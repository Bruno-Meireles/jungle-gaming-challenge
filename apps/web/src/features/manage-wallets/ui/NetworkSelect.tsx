import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jg/design-system';
import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { NETWORK_IDS, type NetworkId } from '../../../shared/api/contracts/ids';

function isNetworkId(value: string): value is NetworkId {
  return NETWORK_IDS.some((id) => id === value);
}

export type NetworkSelectProps = {
  value: NetworkId;
  disabled: boolean;
  autoFocus: boolean;
  onChange: (network: NetworkId) => void;
};

export function NetworkSelect({ value, disabled, autoFocus, onChange }: NetworkSelectProps) {
  const { t } = useTranslation('manageWallets');
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus) triggerRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="flex flex-col gap-8">
      <Label htmlFor={id}>{t('fields.network')}</Label>
      <Select
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          if (isNetworkId(next)) onChange(next);
        }}
      >
        <SelectTrigger id={id} ref={triggerRef}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {NETWORK_IDS.map((network) => (
            <SelectItem key={network} value={network}>
              {t(`networks.${network}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
