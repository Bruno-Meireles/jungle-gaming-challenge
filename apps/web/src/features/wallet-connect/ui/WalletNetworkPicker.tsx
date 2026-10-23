import { Alert, Button, Label, RadioGroup, RadioGroupItem } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { shortenAddress } from '../../../shared/lib/wallet/shorten-address';

export type PickerWallet = {
  id: string;
  kind: 'primary' | 'secondary';
  networkId: string;
  address: string;
  nickname: string | null;
};

export type WalletNetworkPickerProps = {
  networks: { id: string; label: string }[];
  wallets: PickerWallet[];
  networkId: string;
  walletId: string | null;
  connection: { status: 'disconnected' | 'connecting' | 'connected' | 'rejected'; networkId: string | null };
  onNetworkChange: (networkId: string) => void;
  onWalletSelect: (walletId: string) => void;
  onConnect: (walletId: string) => void;
  onChangeWallet: () => void;
};

function ConnectionActions({ props }: { props: WalletNetworkPickerProps }) {
  const { t } = useTranslation('walletConnect');
  const { connection, walletId, onConnect, onChangeWallet } = props;
  if (connection.status === 'connected') {
    return (
      <>
        <Alert tone="success" toneLabel="">
          {t('connected')}
        </Alert>
        <Button variant="outline" onClick={onChangeWallet}>
          {t('change')}
        </Button>
      </>
    );
  }
  const connecting = connection.status === 'connecting';
  return (
    <>
      {connection.status === 'rejected' ? (
        <Alert tone="error" toneLabel={t('toneLabel')}>
          {t('rejected')}
        </Alert>
      ) : null}
      <Button loading={connecting} disabled={walletId === null} onClick={() => walletId && onConnect(walletId)}>
        {connecting ? t('connecting') : t('connect')}
      </Button>
    </>
  );
}

export function WalletNetworkPicker(props: WalletNetworkPickerProps) {
  const { t } = useTranslation('walletConnect');
  const selectId = useId();
  const { networks, wallets, networkId, walletId, onNetworkChange, onWalletSelect } = props;
  const visible = wallets.filter((w) => w.networkId === networkId);
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-8">
        <Label htmlFor={selectId}>{t('network')}</Label>
        <select
          id={selectId}
          value={networkId}
          onChange={(e) => onNetworkChange(e.target.value)}
          className="h-50 rounded-10 border border-input-border bg-transparent px-16 text-foreground tablet:h-45 tablet:rounded-5"
        >
          {networks.map((n) => (
            <option key={n.id} value={n.id} className="bg-surface-card">
              {n.label}
            </option>
          ))}
        </select>
      </div>
      {visible.length === 0 ? (
        <div className="flex flex-col gap-8">
          <p>{t('empty')}</p>
          <Link to="/account/wallets" className="text-text-accent underline">
            {t('register')}
          </Link>
        </div>
      ) : (
        <>
          <RadioGroup aria-label={t('wallets')} value={walletId ?? ''} onValueChange={onWalletSelect}>
            {visible.map((w) => (
              <RadioGroupItem
                key={w.id}
                variant="card"
                value={w.id}
                className="h-auto items-start rounded-14 border-transparent bg-surface-card px-16 py-16 tablet:h-45 tablet:items-center tablet:rounded-3 tablet:border-border tablet:bg-transparent tablet:py-0"
              >
                <span className="flex min-w-0 flex-col items-start gap-4 tablet:flex-row tablet:items-center tablet:gap-10">
                  <span className="text-body-large-16-bold-lh-16 tablet:text-body-14-regular-lh-16">{t(`kind.${w.kind}`)}</span>
                  <span className="text-body-14-regular-lh-16 text-text-secondary tablet:text-foreground">{shortenAddress(w.address)}</span>
                  {w.nickname ? <span className="text-body-14-regular-lh-16 text-secondary">{w.nickname}</span> : null}
                </span>
              </RadioGroupItem>
            ))}
          </RadioGroup>
          <ConnectionActions props={props} />
        </>
      )}
    </div>
  );
}
