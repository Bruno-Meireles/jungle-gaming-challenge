import { describe, expect, it } from 'vitest';

import { parseEth } from './eth';
import { ethToSteps, stepsToEth } from './eth-steps';

const STEP = parseEth('0.01');

describe('ethToSteps', () => {
  it.each([
    ['12.3', 'floor', 1230],
    ['12.3', 'ceil', 1230],
    ['0.02', 'floor', 2],
    ['0', 'floor', 0],
    ['0.015', 'floor', 1],
    ['0.015', 'ceil', 2],
  ] as const)('converte %s (%s) em %i passos de 0.01', (value, rounding, expected) => {
    expect(ethToSteps(parseEth(value), STEP, rounding)).toBe(expected);
  });

  it('lanca invalid_step para passo zero', () => {
    expect(() => ethToSteps(parseEth('1'), parseEth('0'), 'floor')).toThrow('invalid_step');
  });
});

describe('stepsToEth', () => {
  it.each([
    [2, '0.02'],
    [1230, '12.3'],
    [0, '0'],
    [100, '1'],
  ] as const)('converte %i passos de 0.01 em %s', (steps, expected) => {
    expect(stepsToEth(steps, STEP)).toBe(expected);
  });

  it('lanca invalid_step para passo zero', () => {
    expect(() => stepsToEth(1, parseEth('0'))).toThrow('invalid_step');
  });

  it.each(['0', '0.01', '1.19', '12.3', '250'])('ida e volta preserva %s', (v) => {
    const value = parseEth(v);
    expect(stepsToEth(ethToSteps(value, STEP, 'floor'), STEP)).toBe(value);
    expect(stepsToEth(ethToSteps(value, STEP, 'ceil'), STEP)).toBe(value);
  });
});
