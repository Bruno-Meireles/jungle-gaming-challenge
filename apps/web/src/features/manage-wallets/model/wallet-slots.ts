import type { Wallet } from '../../../shared/api/contracts/account';
import type { NetworkId } from '../../../shared/api/contracts/ids';

export type WalletSlots = { primary: Wallet | null; secondary: Wallet | null };

export function toSlots(wallets: readonly Wallet[]): WalletSlots {
  return {
    primary: wallets.find((w) => w.kind === 'primary') ?? null,
    secondary: wallets.find((w) => w.kind === 'secondary') ?? null,
  };
}

export function isSameAsPrimary(primary: Wallet | null, value: { network: NetworkId; address: string }): boolean {
  return (
    primary !== null &&
    primary.network === value.network &&
    primary.address.toLowerCase() === value.address.trim().toLowerCase()
  );
}
