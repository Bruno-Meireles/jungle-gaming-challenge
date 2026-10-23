import { describe, expect, it } from 'vitest';

import { isFeature } from './features';

describe('isFeature (conta)', () => {
  it.each(['activity', 'watchlist', 'offers', 'downloads', 'support'])('aceita %s', (id) => {
    expect(isFeature(id)).toBe(true);
  });
});
