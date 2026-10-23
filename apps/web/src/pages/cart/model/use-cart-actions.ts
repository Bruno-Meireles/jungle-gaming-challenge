import { useApplyCoupon, useRemoveCartLine, useRemoveCoupon, useUpdateCartLine } from '../../../entities/cart';

function useLineActions() {
  const update = useUpdateCartLine();
  const remove = useRemoveCartLine();
  const ids = [update.isPending ? update.variables?.lineId : undefined, remove.isPending ? remove.variables?.lineId : undefined];
  return {
    updateLine: (lineId: string, quantity: number) => update.mutate({ lineId, quantity }),
    removeLine: (lineId: string) => remove.mutate({ lineId }),
    pendingLineIds: new Set(ids.filter((id): id is string => Boolean(id))),
    lineFailure: update.error ?? remove.error,
    linePending: update.isPending || remove.isPending,
  };
}

function useCouponActions() {
  const apply = useApplyCoupon();
  const remove = useRemoveCoupon();
  return {
    applyCoupon: (code: string) => apply.mutate({ code }),
    removeCoupon: () => remove.mutate(),
    couponFailure: apply.error?.kind ?? remove.error?.kind ?? null,
    couponPending: apply.isPending || remove.isPending,
  };
}

/** Mutacoes do carrinho agrupadas para a tela: linhas pendentes, falha de linha/cupom e flag de ocupado. */
export function useCartActions() {
  const lines = useLineActions();
  const coupon = useCouponActions();
  return { ...lines, ...coupon, mutating: lines.linePending || coupon.couponPending };
}
