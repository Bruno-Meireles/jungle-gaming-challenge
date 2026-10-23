import { describe, expect, it } from 'vitest';
import { safeRedirect } from './safe-redirect';

/*
 * Contrato: safeRedirect(value: unknown, fallback = '/') devolve apenas caminhos internos
 * (comecam com uma unica '/'); qualquer outra coisa (open redirect) cai no fallback.
 */
describe('safeRedirect', () => {
  it.each(['/cart', '/orders/1?x=1#h'])('aceita o caminho interno %s', (path) => {
    expect(safeRedirect(path)).toBe(path);
  });

  it.each([
    ['protocol-relative', '//evil.com'],
    ['barra invertida', '/\\evil.com'],
    ['URL absoluta', 'https://evil.com'],
    ['esquema javascript', 'javascript:alert(1)'],
    ['string vazia', ''],
    ['undefined', undefined],
    ['numero', 123],
    ['sem barra inicial', 'cart'],
    ['quebra de linha', '/cart\nhttps://evil.com'],
    ['retorno de carro', '/cart\rx'],
    ['tab', '/cart\tx'],
  ])('rejeita %s e devolve "/"', (_label, value) => {
    expect(safeRedirect(value)).toBe('/');
  });

  it('nao decodifica %2F%2F para //', () => {
    const result = safeRedirect('/%2F%2Fevil');

    expect(result.startsWith('//')).toBe(false);
  });

  it('usa o fallback informado quando o valor e invalido', () => {
    expect(safeRedirect('//evil.com', '/home')).toBe('/home');
  });
});
