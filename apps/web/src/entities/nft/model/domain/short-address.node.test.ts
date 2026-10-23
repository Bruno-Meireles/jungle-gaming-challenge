import { describe, expect, it } from 'vitest';

import { shortAddress } from './short-address';

describe('shortAddress', () => {
  it('abrevia endereco para 6 primeiros e 4 ultimos caracteres', () => {
    expect(shortAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234…5678');
  });

  it('endereco curto volta inalterado', () => {
    expect(shortAddress('0x1234')).toBe('0x1234');
  });
});
