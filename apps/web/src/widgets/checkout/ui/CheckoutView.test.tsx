import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { renderCheckoutUi } from '../../../test-support/render-checkout';
import type { CheckoutController, PlaceOrderResult, QuoteView } from '../model/ports';
import { CheckoutView } from './CheckoutView';

const quoteOf = (hash: string): QuoteView => ({
  hash,
  lines: [{ tokenId: '042', title: 'Emerald Ape', quantity: 2, unitPriceEth: '0.5', lineTotalEth: '1' }],
  subtotalEth: '1',
  discountEth: '0',
  networkFeeEth: '0.002',
  totalEth: '1.002',
  canCheckout: true,
});

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

type Overrides = Partial<Omit<CheckoutController, 'quote'>>;

function makeController(overrides: Overrides = {}, hash = 'h1'): CheckoutController {
  return {
    formValid: true,
    connection: { status: 'connected', networkId: 'ethereum' },
    network: 'ethereum',
    quote: { status: 'ready', quote: quoteOf(hash) },
    revalidate: vi.fn(async () => ({ hash, canCheckout: true })),
    placeOrder: vi.fn(async (): Promise<PlaceOrderResult> => ({ ok: true, orderId: 'ord-1' })),
    ...overrides,
  };
}

const confirm = () => page.getByRole('button', { name: 'Confirmar compra' });

describe('CheckoutView (duble da porta)', () => {
  it('3 cliques seguidos em Confirmar: 1 revalidate, 1 placeOrder, 1 onPlaced', async () => {
    const gate = deferred<PlaceOrderResult>();
    const controller = makeController({ placeOrder: vi.fn(() => gate.promise) });
    const onPlaced = vi.fn();
    await renderCheckoutUi(<CheckoutView controller={controller} onPlaced={onPlaced} onSessionExpired={() => {}} />);
    // O rotulo muda para 'Validando cotacao...' apos o 1o clique: os cliques seguintes miram o unico botao da tela.
    const button = page.getByRole('button');
    await confirm().click({ force: true });
    await button.click({ force: true });
    await button.click({ force: true });
    await expect.poll(() => (controller.placeOrder as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
    expect(controller.revalidate).toHaveBeenCalledTimes(1);
    gate.resolve({ ok: true, orderId: 'ord-1' });
    await expect.poll(() => onPlaced.mock.calls).toEqual([['ord-1']]);
    expect(controller.placeOrder).toHaveBeenCalledTimes(1);
  });

  it('nao confirma quando o controller nao permite (formulario invalido)', async () => {
    const controller = makeController({ formValid: false });
    await renderCheckoutUi(<CheckoutView controller={controller} onPlaced={() => {}} onSessionExpired={() => {}} />);
    await expect.element(confirm()).toHaveAttribute('aria-disabled', 'true');
    await confirm().click({ force: true });
    expect(controller.revalidate).not.toHaveBeenCalled();
  });

  it('hash revalidado diferente: alerta, nao envia e exige novo clique', async () => {
    const placeOrder = vi.fn(async (): Promise<PlaceOrderResult> => ({ ok: true, orderId: 'ord-2' }));
    const onPlaced = vi.fn();
    function Host() {
      const [hash, setHash] = useState('h1');
      const controller = makeController(
        {
          placeOrder,
          revalidate: vi.fn(async () => {
            setHash('h2');
            return { hash: 'h2', canCheckout: true };
          }),
        },
        hash,
      );
      return <CheckoutView controller={controller} onPlaced={onPlaced} onSessionExpired={() => {}} />;
    }
    await renderCheckoutUi(<Host />);
    await confirm().click();
    await expect.element(page.getByRole('alert')).toMatchTextContent('A cotação mudou. Revise os valores e confirme novamente.');
    expect(placeOrder).not.toHaveBeenCalled();
    await confirm().click();
    await expect.poll(() => onPlaced.mock.calls).toEqual([['ord-2']]);
    expect(placeOrder).toHaveBeenCalledTimes(1);
  });

  it('falha de revalidacao mostra alerta e permite tentar de novo', async () => {
    const controller = makeController({ revalidate: vi.fn(async () => Promise.reject(new Error('network'))) });
    await renderCheckoutUi(<CheckoutView controller={controller} onPlaced={() => {}} onSessionExpired={() => {}} />);
    await confirm().click();
    await expect.element(page.getByRole('alert')).toMatchTextContent('Não foi possível validar a cotação. Tente novamente.');
    await expect.element(confirm()).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('onRecovering exibe role=status enquanto o pedido e recuperado', async () => {
    const gate = deferred<PlaceOrderResult>();
    const controller = makeController({
      placeOrder: vi.fn(async ({ onRecovering }) => {
        onRecovering();
        return gate.promise;
      }),
    });
    await renderCheckoutUi(<CheckoutView controller={controller} onPlaced={() => {}} onSessionExpired={() => {}} />);
    await confirm().click();
    await expect.element(page.getByRole('status')).toMatchTextContent(/Recuperando seu pedido/);
    gate.resolve({ ok: true, orderId: 'ord-1' });
  });

  it('falha de envio volta a revisao com o aviso do motivo', async () => {
    const controller = makeController({ placeOrder: vi.fn(async (): Promise<PlaceOrderResult> => ({ ok: false, reason: 'unavailable' })) });
    await renderCheckoutUi(<CheckoutView controller={controller} onPlaced={() => {}} onSessionExpired={() => {}} />);
    await confirm().click();
    await expect.element(page.getByRole('alert')).toMatchTextContent('Algum item não está mais disponível. Revise seu carrinho.');
  });

  it('session_expired chama onSessionExpired e nao onPlaced', async () => {
    const onSessionExpired = vi.fn();
    const onPlaced = vi.fn();
    const controller = makeController({ placeOrder: vi.fn(async (): Promise<PlaceOrderResult> => ({ ok: false, reason: 'session_expired' })) });
    await renderCheckoutUi(<CheckoutView controller={controller} onPlaced={onPlaced} onSessionExpired={onSessionExpired} />);
    await confirm().click();
    await expect.poll(() => onSessionExpired.mock.calls.length).toBe(1);
    expect(onPlaced).not.toHaveBeenCalled();
  });
});
