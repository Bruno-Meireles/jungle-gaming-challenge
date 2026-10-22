export type EthAmount = string & { readonly __brand: 'EthAmount' };

const ETH_DECIMAL = /^\d+(\.\d{1,18})?$/;
const DECIMALS = 18;

export function isEthDecimal(value: string): boolean {
  return ETH_DECIMAL.test(value);
}

function isBranded(value: string): value is EthAmount {
  return isEthDecimal(value);
}

function canonicalize(value: string): string {
  const [integer = '', fraction = ''] = value.split('.');
  const intPart = integer.replace(/^0+(?=\d)/, '');
  const fracPart = fraction.replace(/0+$/, '');
  return fracPart === '' ? intPart : `${intPart}.${fracPart}`;
}

export function parseEth(value: string): EthAmount {
  if (!isEthDecimal(value)) throw new Error('invalid_eth');
  const canonical = canonicalize(value);
  if (isBranded(canonical)) return canonical;
  throw new Error('invalid_eth');
}

export function toWei(value: EthAmount): bigint {
  const [integer = '0', fraction = ''] = value.split('.');
  return BigInt(integer) * 10n ** BigInt(DECIMALS) + BigInt(fraction.padEnd(DECIMALS, '0'));
}

export function compareEth(a: EthAmount, b: EthAmount): -1 | 0 | 1 {
  const wa = toWei(a);
  const wb = toWei(b);
  if (wa === wb) return 0;
  return wa < wb ? -1 : 1;
}

/** Valida sem normalizar: preserva o texto da API (ex.: "12.30") para a exibicao do preco. */
export function asEthAmount(value: string): EthAmount {
  if (isBranded(value)) return value;
  throw new Error('invalid_eth');
}
