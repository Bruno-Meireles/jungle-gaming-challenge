import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALES, resolveLocale, type Locale } from './resolve-locale';

describe('resolveLocale', () => {
  it('expoe os idiomas suportados e pt-BR como padrao', () => {
    expect(LOCALES).toEqual(['pt-BR', 'en']);
    expect(DEFAULT_LOCALE).toBe('pt-BR');
  });

  it.each<[string, string | null, string[], Locale]>([
    ['saved en vence navegador pt', 'en', ['pt-BR'], 'en'],
    ['saved pt-BR vence navegador en', 'pt-BR', ['en-US'], 'pt-BR'],
    ['saved invalido e ignorado', 'fr', ['en-US'], 'en'],
    ['saved nulo e ignorado', null, ['en-GB'], 'en'],
  ])('preferencia salva: %s', (_name, saved, languages, expected) => {
    expect(resolveLocale({ saved, languages })).toBe(expected);
  });

  it.each<[string[], Locale]>([
    [['en'], 'en'],
    [['en-US'], 'en'],
    [['en-GB'], 'en'],
    [['pt'], 'pt-BR'],
    [['pt-BR'], 'pt-BR'],
    [['pt-PT'], 'pt-BR'],
    [['en-US', 'pt-BR'], 'en'],
    [['pt-PT', 'en-US'], 'pt-BR'],
  ])('idiomas do navegador %j resolvem para %s', (languages, expected) => {
    expect(resolveLocale({ saved: null, languages })).toBe(expected);
  });

  it.each<[string[], Locale]>([
    [['fr-FR', 'en-US'], 'en'],
    [['de', 'es', 'pt-PT'], 'pt-BR'],
  ])('pula idiomas desconhecidos: %j -> %s', (languages, expected) => {
    expect(resolveLocale({ saved: null, languages })).toBe(expected);
  });

  it.each<[string[]]>([[[]], [['fr-FR', 'ja']]])('sem correspondencia %j cai em pt-BR', (languages) => {
    expect(resolveLocale({ saved: null, languages })).toBe('pt-BR');
  });

  it.each<[string[], Locale]>([
    [['EN-us'], 'en'],
    [['PT-br'], 'pt-BR'],
  ])('ignora caixa em %j', (languages, expected) => {
    expect(resolveLocale({ saved: null, languages })).toBe(expected);
  });
});
