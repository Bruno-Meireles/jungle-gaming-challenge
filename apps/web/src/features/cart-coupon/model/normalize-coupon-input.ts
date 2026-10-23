export type CouponInput = { kind: 'ok'; code: string } | { kind: 'required' };

export function normalizeCouponInput(raw: string): CouponInput {
  const code = raw.trim();
  return code === '' ? { kind: 'required' } : { kind: 'ok', code };
}
