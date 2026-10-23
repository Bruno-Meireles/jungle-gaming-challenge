import { describe, expect, it } from 'vitest';

import { normalizeCouponInput } from './normalize-coupon-input';

describe('normalizeCouponInput', () => {
  it('apara espacos nas pontas e mantem o codigo como digitado', () => {
    expect(normalizeCouponInput('  LAUNCH10 ')).toEqual({ kind: 'ok', code: 'LAUNCH10' });
  });

  it('nao altera caixa nem espacos internos (quem valida o cupom e o servidor)', () => {
    expect(normalizeCouponInput('launch 10')).toEqual({ kind: 'ok', code: 'launch 10' });
  });

  it.each(['', '   ', '\t\n'])('vazio ou so espacos (%j) vira required', (raw) => {
    expect(normalizeCouponInput(raw)).toEqual({ kind: 'required' });
  });
});
