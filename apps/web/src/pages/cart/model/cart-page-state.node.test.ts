import { describe, expect, it } from 'vitest';

import { toCartPageState } from './cart-page-state';

describe('toCartPageState', () => {
  it('consulta pendente e loading', () => {
    expect(toCartPageState({ status: 'pending' })).toBe('loading');
  });

  it('consulta com erro e error', () => {
    expect(toCartPageState({ status: 'error' })).toBe('error');
  });

  it('sucesso sem linhas e empty', () => {
    expect(toCartPageState({ status: 'success', lineCount: 0 })).toBe('empty');
  });

  it('sucesso com linhas e ready', () => {
    expect(toCartPageState({ status: 'success', lineCount: 3 })).toBe('ready');
  });
});
