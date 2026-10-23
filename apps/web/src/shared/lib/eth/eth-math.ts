import { asEthAmount, toWei, type EthAmount } from './eth';

export { asEthAmount };

const DECIMALS = 18;

function fromWei(wei: bigint): EthAmount {
  if (wei < 0n) throw new Error('negative_eth');
  const text = wei.toString().padStart(DECIMALS + 1, '0');
  const cut = text.length - DECIMALS;
  const fraction = text.slice(cut).replace(/0+$/, '');
  return asEthAmount(fraction === '' ? text.slice(0, cut) : `${text.slice(0, cut)}.${fraction}`);
}

export function addEth(a: EthAmount, b: EthAmount): EthAmount {
  return fromWei(toWei(a) + toWei(b));
}

export function subEth(a: EthAmount, b: EthAmount): EthAmount {
  return fromWei(toWei(a) - toWei(b));
}

export function sumEth(values: readonly EthAmount[]): EthAmount {
  return fromWei(values.reduce((acc, v) => acc + toWei(v), 0n));
}

export function mulEthInt(value: EthAmount, quantity: number): EthAmount {
  return fromWei(toWei(value) * BigInt(quantity));
}

export function percentOfEth(value: EthAmount, percent: number): EthAmount {
  return fromWei((toWei(value) * BigInt(percent)) / 100n);
}
