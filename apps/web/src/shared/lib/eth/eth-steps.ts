import { parseEth, type EthAmount } from './eth';

export function ethToSteps(
  value: EthAmount,
  step: EthAmount,
  rounding: 'floor' | 'ceil',
): number {
  void value;
  void step;
  void rounding;
  return 0;
}

export function stepsToEth(steps: number, step: EthAmount): EthAmount {
  void steps;
  void step;
  return parseEth('0');
}
