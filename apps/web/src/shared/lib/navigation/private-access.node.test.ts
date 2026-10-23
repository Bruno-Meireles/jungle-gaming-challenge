import { describe, expect, it } from 'vitest';

import { resolvePrivateAccess } from './private-access';

describe('resolvePrivateAccess', () => {
  it('permite sessao autenticada', () => {
    expect(resolvePrivateAccess({ session: 'authenticated', href: '/orders/ord-1' })).toEqual({ kind: 'allow' });
  });

  it('anonimo vai para login com redirect para o destino interno', () => {
    expect(resolvePrivateAccess({ session: 'anonymous', href: '/orders/ord-1?x=1' })).toEqual({
      kind: 'login',
      redirect: '/orders/ord-1?x=1',
    });
  });

  it.each(['https://evil.example/x', '//evil.example', '/\\evil'])('href externo %s vira redirect "/"', (href) => {
    expect(resolvePrivateAccess({ session: 'anonymous', href })).toEqual({ kind: 'login', redirect: '/' });
  });
});
