import { describe, expect, it } from 'vitest';

import { pickLocalized } from './pick-localized';

const text = { 'pt-BR': 'Olá', en: 'Hello' };

describe('pickLocalized', () => {
  it('escolhe o texto do idioma', () => {
    expect(pickLocalized(text, 'pt-BR')).toBe('Olá');
    expect(pickLocalized(text, 'en')).toBe('Hello');
  });

  it('variante regional resolve pelo idioma base', () => {
    expect(pickLocalized(text, 'pt')).toBe('Olá');
    expect(pickLocalized(text, 'en-US')).toBe('Hello');
  });

  it('idioma desconhecido cai em en', () => {
    expect(pickLocalized(text, 'fr')).toBe('Hello');
  });

  it('texto vazio no idioma cai no outro idioma', () => {
    expect(pickLocalized({ 'pt-BR': '', en: 'Hello' }, 'pt-BR')).toBe('Hello');
  });
});
