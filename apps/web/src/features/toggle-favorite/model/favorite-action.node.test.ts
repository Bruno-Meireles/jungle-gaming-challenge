import { describe, expect, it } from 'vitest';

import { buildLoginRedirect } from './favorite-action';

describe('buildLoginRedirect', () => {
  it('leva para /login com o caminho atual (e search) codificado em redirect', () => {
    expect(buildLoginRedirect('/nfts/emerald-ape-042?edition=1-10&tab=reviews')).toBe(
      '/login?redirect=%2Fnfts%2Femerald-ape-042%3Fedition%3D1-10%26tab%3Dreviews',
    );
  });

  it.each(['//evil.com', 'https://evil.com', 'javascript:alert(1)', ''])('destino inseguro %j vira /login simples', (path) => {
    expect(buildLoginRedirect(path)).toBe('/login');
  });
});
