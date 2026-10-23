import { useReducer, useRef } from 'react';

import { checkoutReducer, initialCheckoutState, type CheckoutEvent, type CheckoutState } from '../../../features/place-order';
import { canConfirm } from './can-confirm';
import type { CheckoutController } from './ports';

type Handlers = { onPlaced: (orderId: string) => void; onSessionExpired: () => void };
type Dispatch = (event: CheckoutEvent) => void;

type Ctx = { controller: CheckoutController; dispatch: Dispatch; handlers: Handlers };

async function submit({ controller, dispatch, handlers }: Ctx, quoteHash: string) {
  const result = await controller.placeOrder({ quoteHash, onRecovering: () => dispatch({ type: 'SUBMIT_RECOVERING' }) });
  if (result.ok) {
    dispatch({ type: 'ORDER_CREATED', orderId: result.orderId });
    handlers.onPlaced(result.orderId);
    return;
  }
  dispatch({ type: 'SUBMIT_FAILED', reason: result.reason });
  if (result.reason === 'session_expired') handlers.onSessionExpired();
}

async function run(ctx: Ctx, displayedHash: string) {
  const { controller, dispatch } = ctx;
  dispatch({ type: 'CONFIRM', displayedHash, canConfirm: true });
  let revalidated: { hash: string; canCheckout: boolean };
  try {
    revalidated = await controller.revalidate();
  } catch {
    dispatch({ type: 'REVALIDATION_FAILED' });
    return;
  }
  dispatch({ type: 'REVALIDATED', ...revalidated });
  if (!revalidated.canCheckout || revalidated.hash !== displayedHash) return;
  await submit(ctx, revalidated.hash);
}

export function useCheckoutFlow(controller: CheckoutController, handlers: Handlers) {
  const [state, dispatch] = useReducer(checkoutReducer, initialCheckoutState);
  const busy = useRef(false);
  const allowed = canConfirm(controller);

  const confirm = () => {
    if (busy.current || !allowed || controller.quote.status !== 'ready') return;
    busy.current = true;
    run({ controller, dispatch, handlers }, controller.quote.quote.hash)
      .catch(() => dispatch({ type: 'SUBMIT_FAILED', reason: 'unexpected' }))
      .finally(() => {
        busy.current = false;
      });
  };

  return { state: state satisfies CheckoutState, canConfirm: allowed, confirm };
}
