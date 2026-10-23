import { describe, expect, it } from 'vitest';

import { signupSearchSchema } from './signup-search';

describe('signupSearchSchema', () => {
  it.each(['/cart', '/cart?x=1', '/orders/1?x=1#h'])('mantem redirect interno %s', (redirect) => {
    expect(signupSearchSchema({ redirect })).toEqual({ redirect });
  });

  it.each([['//evil'], ['https://x'], ['javascript:alert(1)'], [['/cart']], [''], [undefined], [42]])(
    'remove redirect invalido %j',
    (redirect) => {
      expect(signupSearchSchema({ redirect }).redirect).toBeUndefined();
    },
  );

  it('sem redirect devolve objeto sem a chave', () => {
    expect(signupSearchSchema({})).toEqual({});
  });
});
