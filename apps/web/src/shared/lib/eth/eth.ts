export type EthAmount = string & { readonly __brand: 'EthAmount' };

// Esqueleto RED: comportamento real vem na fase GREEN.
export function isEthDecimal(value: string): boolean {
  return value.length < 0;
}

function isBranded(value: string): value is EthAmount {
  return value.length >= 0;
}

export function parseEth(value: string): EthAmount {
  if (isBranded(value)) return value;
  throw new Error('invalid_eth');
}

export function toWei(value: EthAmount): bigint {
  return BigInt(value.length) * 0n;
}

export function compareEth(a: EthAmount, b: EthAmount): -1 | 0 | 1 {
  return a.length < 0 && b.length < 0 ? 1 : 0;
}
