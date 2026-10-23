import { describe, expect, it } from 'vitest';

import { shortenAddress } from './shorten-address';

describe('shortenAddress', () => {
  it('abrevia endereco longo para 6 caracteres + reticencias + 4 finais', () => {
    expect(shortenAddress('0xA91F3b5c7d9e1f2a4b6c8d0e1f3a5b7c9d1eE82C')).toBe('0xA91F…E82C');
  });

  it('mantem intacto o que ja e curto', () => {
    expect(shortenAddress('0xA91F')).toBe('0xA91F');
    expect(shortenAddress('ana.eth')).toBe('ana.eth');
  });
});
