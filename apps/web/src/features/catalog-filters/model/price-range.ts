import type { Locale } from '../../../shared/lib/i18n/resolve-locale';
import { parseEth, type EthAmount } from '../../../shared/lib/eth/eth';
import { ethToSteps, stepsToEth } from '../../../shared/lib/eth/eth-steps';
import { formatEthFixed } from '../../../shared/lib/eth/format-eth';

/*
 * Slider em passos inteiros de 0.01 ETH (decisao do plano 3.5/ADR-18): nada passa por float.
 * A faixa vem da API (`priceRange`), arredondada para fora (piso do minimo, teto do maximo).
 */
const STEP = parseEth('0.01');
const FRACTION_DIGITS = 2;

export type PriceRangeDto = { minEth: string; maxEth: string };
export type PriceBounds = { lo: number; hi: number };
export type PriceSelection = { min?: string; max?: string };

export function boundsOf(range: PriceRangeDto): PriceBounds {
  return {
    lo: ethToSteps(parseEth(range.minEth), STEP, 'floor'),
    hi: ethToSteps(parseEth(range.maxEth), STEP, 'ceil'),
  };
}

const clamp = (value: number, { lo, hi }: PriceBounds): number => Math.min(Math.max(value, lo), hi);

export function selectionToSteps(bounds: PriceBounds, selection: PriceSelection): [number, number] {
  const lo = selection.min === undefined ? bounds.lo : ethToSteps(parseEth(selection.min), STEP, 'floor');
  const hi = selection.max === undefined ? bounds.hi : ethToSteps(parseEth(selection.max), STEP, 'ceil');
  return [clamp(lo, bounds), clamp(hi, bounds)];
}

/** Extremos da faixa viram "sem filtro": o param some da URL. */
export function stepsToSelection(bounds: PriceBounds, [lo, hi]: [number, number]): PriceSelection {
  return {
    ...(lo === bounds.lo ? {} : { min: stepsToEth(lo, STEP) }),
    ...(hi === bounds.hi ? {} : { max: stepsToEth(hi, STEP) }),
  };
}

export function formatSteps(steps: number, locale: Locale): string {
  const amount: EthAmount = stepsToEth(steps, STEP);
  return formatEthFixed(amount, locale, FRACTION_DIGITS);
}
