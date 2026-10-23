import { describe, expect, it } from 'vitest';

import { toSaveRequest, validateWalletForm } from './wallet-form';

const good = '0x71c7656ec7ab88b098defb751b7401b5f6d8976f';

describe('validateWalletForm', () => {
  it('vazio e invalido por rede', () => {
    expect(validateWalletForm({ network: 'ethereum', address: ' ' })).toEqual({ address: 'required' });
    expect(validateWalletForm({ network: 'ethereum', address: '0x123' })).toEqual({ address: 'invalid_address' });
    expect(validateWalletForm({ network: 'ethereum', address: good })).toEqual({});
    expect(validateWalletForm({ network: 'solana', address: good })).toEqual({ address: 'invalid_address' });
  });
});

describe('toSaveRequest', () => {
  it('monta o pedido com trim e kind', () => {
    expect(toSaveRequest('secondary', { network: 'ethereum', address: ` ${good} ` })).toEqual({
      kind: 'secondary',
      network: 'ethereum',
      address: good,
    });
  });
});
