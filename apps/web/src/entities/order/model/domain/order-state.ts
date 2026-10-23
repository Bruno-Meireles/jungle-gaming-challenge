import type { CheckoutPhase, OrderStatus } from './order';

export type CheckoutEvent =
  | { type: 'confirm' }
  | { type: 'quote_changed' }
  | { type: 'quote_same' }
  | { type: 'order_created' }
  | { type: 'timeout_recovered' }
  | { type: 'order_status'; status: OrderStatus };

/** Maquina de estados do pedido (esqueleto; implementacao no GREEN). */
export function nextCheckoutPhase(phase: CheckoutPhase, event: CheckoutEvent): CheckoutPhase {
  void phase;
  void event;
  throw new Error('not_implemented');
}

export function isTerminalStatus(status: OrderStatus): boolean {
  void status;
  throw new Error('not_implemented');
}

/** Decide se uma versao recebida deve ser aplicada (ignora duplicata e antiga). */
export function shouldApplyVersion(known: number | undefined, incoming: number): boolean {
  void known;
  void incoming;
  throw new Error('not_implemented');
}
