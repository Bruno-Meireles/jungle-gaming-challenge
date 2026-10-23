import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { renderCheckoutUi } from '../../../test-support/render-checkout';
import { CheckoutNotice } from './CheckoutNotice';
import { ConfirmPurchaseButton } from './ConfirmPurchaseButton';

/* Textos: contrato de i18n deste teste (namespace placeOrder); o Figma nao define mensagens de aviso. */
const NOTICES = {
  'pt-BR': {
    quote_changed: 'A cotação mudou. Revise os valores e confirme novamente.',
    unavailable: 'Algum item não está mais disponível. Revise seu carrinho.',
    revalidation_failed: 'Não foi possível validar a cotação. Tente novamente.',
    idempotency_conflict: 'Este pedido conflita com um envio anterior. Revise os dados e tente novamente.',
    wallet_disconnected: 'Sua carteira foi desconectada. Conecte novamente para continuar.',
    validation: 'Alguns dados do pedido são inválidos. Revise o formulário.',
    recovery_exhausted: 'Não conseguimos confirmar o envio do pedido. Confira seus pedidos antes de tentar de novo.',
    unexpected: 'Algo deu errado ao finalizar a compra. Tente novamente.',
  },
  en: {
    quote_changed: 'The quote changed. Review the amounts and confirm again.',
    unavailable: 'An item is no longer available. Review your cart.',
    revalidation_failed: 'We could not validate the quote. Please try again.',
    idempotency_conflict: 'This order conflicts with a previous submission. Review your details and try again.',
    wallet_disconnected: 'Your wallet was disconnected. Reconnect to continue.',
    validation: 'Some order details are invalid. Review the form.',
    recovery_exhausted: 'We could not confirm the order submission. Check your orders before trying again.',
    unexpected: 'Something went wrong while completing the purchase. Please try again.',
  },
} as const;

const BUTTON = {
  'pt-BR': { idle: 'Confirmar compra', revalidating: 'Validando cotação…', submitting: 'Enviando pedido…' },
  en: { idle: 'Confirm purchase', revalidating: 'Validating quote…', submitting: 'Submitting order…' },
} as const;

describe.each(['pt-BR', 'en'] as const)('CheckoutNotice (%s)', (locale) => {
  it.each(Object.keys(NOTICES[locale]) as (keyof (typeof NOTICES)['pt-BR'])[])('aviso %s e um role=alert traduzido', async (notice) => {
    await renderCheckoutUi(<CheckoutNotice notice={notice} />, locale);
    await expect.element(page.getByRole('alert')).toHaveTextContent(NOTICES[locale][notice]);
  });

  it('sem aviso nao renderiza alerta', async () => {
    await renderCheckoutUi(<CheckoutNotice notice={null} />, locale);
    expect(page.getByRole('alert').query()).toBeNull();
  });
});

describe.each(['pt-BR', 'en'] as const)('ConfirmPurchaseButton (%s)', (locale) => {
  const b = BUTTON[locale];

  it('ocioso e habilitado: clica e confirma', async () => {
    const onConfirm = vi.fn();
    await renderCheckoutUi(<ConfirmPurchaseButton phase="idle" canConfirm onConfirm={onConfirm} />, locale);
    const button = page.getByRole('button', { name: b.idle });
    await expect.element(button).not.toHaveAttribute('aria-disabled', 'true');
    await button.click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('sem canConfirm usa aria-disabled e nao dispara', async () => {
    const onConfirm = vi.fn();
    await renderCheckoutUi(<ConfirmPurchaseButton phase="idle" canConfirm={false} onConfirm={onConfirm} />, locale);
    const button = page.getByRole('button', { name: b.idle });
    await expect.element(button).toHaveAttribute('aria-disabled', 'true');
    await button.click({ force: true });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it.each(['revalidating', 'submitting'] as const)('fase %s: aria-disabled, rotulo de progresso e sem disparo', async (phase) => {
    const onConfirm = vi.fn();
    await renderCheckoutUi(<ConfirmPurchaseButton phase={phase} canConfirm onConfirm={onConfirm} />, locale);
    const button = page.getByRole('button', { name: b[phase] });
    await expect.element(button).toHaveAttribute('aria-disabled', 'true');
    await button.click({ force: true });
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
