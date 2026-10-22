import { parseEth, toWei, type EthAmount } from './eth';

const DECIMALS = 18;

function stepWei(step: EthAmount): bigint {
  const wei = toWei(step);
  if (wei === 0n) throw new Error('invalid_step');
  return wei;
}

export function ethToSteps(
  value: EthAmount,
  step: EthAmount,
  rounding: 'floor' | 'ceil',
): number {
  const unit = stepWei(step);
  const wei = toWei(value);
  const floor = wei / unit;
  const steps = rounding === 'ceil' && wei % unit !== 0n ? floor + 1n : floor;
  return Number(steps);
}

export function stepsToEth(steps: number, step: EthAmount): EthAmount {
  const total = (BigInt(steps) * stepWei(step)).toString().padStart(DECIMALS + 1, '0');
  const cut = total.length - DECIMALS;
  return parseEth(`${total.slice(0, cut)}.${total.slice(cut)}`);
}
