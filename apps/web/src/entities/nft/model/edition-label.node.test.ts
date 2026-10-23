import { describe, expect, it } from 'vitest';

import { editionLabel } from './edition-label';

describe('editionLabel', () => {
  it('edicao limitada devolve chave com o tamanho', () => {
    expect(editionLabel({ type: 'limited', size: 10 })).toEqual({ key: 'edition.limited', params: { size: 10 } });
  });

  it('edicao aberta devolve chave sem parametros', () => {
    expect(editionLabel({ type: 'open' })).toEqual({ key: 'edition.open', params: {} });
  });
});
