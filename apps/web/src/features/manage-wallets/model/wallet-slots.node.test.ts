import { describe, expect, it } from 'vitest';

import type { Wallet } from '../../../shared/api/contracts/account';
import { isSameAsPrimary, toSlots } from './wallet-slots';

const primary: Wallet = { id: 'p', kind: 'primary', network: 'ethereum', address: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f' };
const secondary: Wallet = { id: 's', kind: 'secondary', network: 'polygon', address: '0x1111111111111111111111111111111111111111' };

describe('toSlots', () => {
  it('separa primaria e secundaria, ausentes viram null', () => {
    expect(toSlots([secondary, primary])).toEqual({ primary, secondary });
    expect(toSlots([primary])).toEqual({ primary, secondary: null });
    expect(toSlots([])).toEqual({ primary: null, secondary: null });
  });
});

describe('isSameAsPrimary', () => {
  it('compara rede e endereco sem diferenciar maiusculas', () => {
    expect(isSameAsPrimary(primary, { network: 'ethereum', address: primary.address.toUpperCase().replace('0X', '0x') })).toBe(true);
    expect(isSameAsPrimary(primary, { network: 'polygon', address: primary.address })).toBe(false);
    expect(isSameAsPrimary(null, { network: 'ethereum', address: primary.address })).toBe(false);
  });
});
