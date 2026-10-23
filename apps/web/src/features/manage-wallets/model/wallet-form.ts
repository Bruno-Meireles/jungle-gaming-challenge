import { isValidWalletAddress, type SaveWalletRequest, type WalletKind } from '../../../shared/api/contracts/account';
import type { NetworkId } from '../../../shared/api/contracts/ids';

export type WalletFormValues = { network: NetworkId; address: string };
export type WalletFormErrors = { address?: 'required' | 'invalid_address' };

export function validateWalletForm(values: WalletFormValues): WalletFormErrors {
  const address = values.address.trim();
  if (address === '') return { address: 'required' };
  return isValidWalletAddress(values.network, address) ? {} : { address: 'invalid_address' };
}

export function toSaveRequest(kind: WalletKind, values: WalletFormValues): SaveWalletRequest {
  return { kind, network: values.network, address: values.address.trim() };
}
