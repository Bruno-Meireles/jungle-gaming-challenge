import { describe, expect, it } from 'vitest';

import { nftDetailSearchSchema } from './nft-detail-search';

describe('nftDetailSearchSchema', () => {
  it('sem parametros usa tab details e sem edition', () => {
    expect(nftDetailSearchSchema({})).toEqual({ tab: 'details' });
  });

  it.each(['details', 'reviews'])('mantem tab %s', (tab) => {
    expect(nftDetailSearchSchema({ tab }).tab).toBe(tab);
  });

  it.each([['other'], [''], [42], [['reviews']], [null]])('tab invalida %j vira details', (tab) => {
    expect(nftDetailSearchSchema({ tab }).tab).toBe('details');
  });

  it('mantem edition valida', () => {
    expect(nftDetailSearchSchema({ edition: '1-50', tab: 'reviews' })).toEqual({ edition: '1-50', tab: 'reviews' });
  });

  it.each([[''], [42], [['1-10']], ['a b<script>'], ['x'.repeat(65)], [undefined]])(
    'edition invalida %j e descartada',
    (edition) => {
      expect(nftDetailSearchSchema({ edition })).not.toHaveProperty('edition');
    },
  );
});
