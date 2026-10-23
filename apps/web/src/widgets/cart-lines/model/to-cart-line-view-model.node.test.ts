import { describe, expect, it } from 'vitest';

import { cartLine, fakeT, quoteLine } from '../../../../tests/cart/fixtures';
import { toCartLineViewModel } from './to-cart-line-view-model';

const ctx = (locale: 'pt-BR' | 'en') => ({ locale, t: fakeT });

describe('toCartLineViewModel', () => {
  it('monta titulo, link para o detalhe, imagem, token e edicao', () => {
    const vm = toCartLineViewModel({ line: cartLine(), quoteLine: quoteLine(), ...ctx('pt-BR') });
    expect(vm).toMatchObject({
      lineId: 'line-1',
      title: 'Cosmic Bloom #118',
      href: '/nfts/cosmic-bloom-118',
      image: { src: '/img/cosmic-bloom.png', alt: 'cartLines:image.alt(title=Cosmic Bloom #118)' },
      tokenLabel: '#0042',
      editionLabel: 'cartLines:edition(number=3,supply=10)',
      quantity: 2,
      min: 1,
      max: 5,
    });
  });

  it('formata preco unitario e total da linha vindos da cotacao, por idioma, sem Number', () => {
    const q = quoteLine({ unitPrice: '1234.5', lineTotal: '2469' });
    const pt = toCartLineViewModel({ line: cartLine(), quoteLine: q, ...ctx('pt-BR') });
    const en = toCartLineViewModel({ line: cartLine(), quoteLine: q, ...ctx('en') });
    expect(pt.unitPriceLabel).toBe('shared:eth.amount(amount=1.234,50)');
    expect(pt.lineTotalLabel).toBe('shared:eth.amount(amount=2.469,00)');
    expect(en.unitPriceLabel).toBe('shared:eth.amount(amount=1,234.50)');
    expect(en.lineTotalLabel).toBe('shared:eth.amount(amount=2,469.00)');
  });

  it('preserva 18 casas decimais (string, nao float)', () => {
    const q = quoteLine({ unitPrice: '0.000000000000000001', lineTotal: '0.000000000000000002' });
    const vm = toCartLineViewModel({ line: cartLine(), quoteLine: q, ...ctx('pt-BR') });
    expect(vm.unitPriceLabel).toBe('shared:eth.amount(amount=0,000000000000000001)');
    expect(vm.lineTotalLabel).toBe('shared:eth.amount(amount=0,000000000000000002)');
  });

  it('sem linha de cotacao: usa o preco do carrinho e deixa o total da linha nulo (nada calculado no cliente)', () => {
    const vm = toCartLineViewModel({ line: cartLine({ unitPrice: '1.29' }), quoteLine: undefined, ...ctx('pt-BR') });
    expect(vm.unitPriceLabel).toBe('shared:eth.amount(amount=1,29)');
    expect(vm.lineTotalLabel).toBeNull();
  });

  it('canIncrement so e verdadeiro abaixo do maximo', () => {
    const below = toCartLineViewModel({ line: cartLine({ quantity: 4, maxQuantity: 5 }), quoteLine: undefined, ...ctx('en') });
    const at = toCartLineViewModel({ line: cartLine({ quantity: 5, maxQuantity: 5 }), quoteLine: undefined, ...ctx('en') });
    expect(below.canIncrement).toBe(true);
    expect(at.canIncrement).toBe(false);
  });

  it('repassa o aviso da cotacao e marca bloqueio so para sold_out ou quantidade acima do maximo', () => {
    const base = { line: cartLine(), ...ctx('en') };
    const sold = toCartLineViewModel({ ...base, quoteLine: quoteLine({ notice: { kind: 'sold_out' } }) });
    const price = toCartLineViewModel({
      ...base,
      quoteLine: quoteLine({ notice: { kind: 'price_changed', previousUnitPrice: '1.00', unitPrice: '1.29' } }),
    });
    const over = toCartLineViewModel({ line: cartLine({ quantity: 6, maxQuantity: 5 }), quoteLine: undefined, ...ctx('en') });
    const ok = toCartLineViewModel({ ...base, quoteLine: quoteLine() });
    expect(sold.notice).toEqual({ kind: 'sold_out' });
    expect(sold.blocking).toBe(true);
    expect(price.notice).toEqual({ kind: 'price_changed', previousUnitPrice: '1.00', unitPrice: '1.29' });
    expect(price.blocking).toBe(false);
    expect(over.blocking).toBe(true);
    expect(ok.notice).toBeNull();
    expect(ok.blocking).toBe(false);
  });
});
