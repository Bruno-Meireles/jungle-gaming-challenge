import { describe, expect, it } from 'vitest';

import { targetIndex } from './use-hero-swipe';

describe('targetIndex', () => {
  it('gesto curto nao troca de slide', () => {
    expect(targetIndex({ index: 1, total: 3, dx: -20, width: 450 })).toBe(1);
    expect(targetIndex({ index: 1, total: 3, dx: 60, width: 450 })).toBe(1);
  });

  it('arrastar para a esquerda avanca e para a direita volta', () => {
    expect(targetIndex({ index: 1, total: 3, dx: -100, width: 450 })).toBe(2);
    expect(targetIndex({ index: 1, total: 3, dx: 100, width: 450 })).toBe(0);
  });

  it('nao passa dos extremos', () => {
    expect(targetIndex({ index: 0, total: 3, dx: 300, width: 450 })).toBe(0);
    expect(targetIndex({ index: 2, total: 3, dx: -300, width: 450 })).toBe(2);
  });
});
