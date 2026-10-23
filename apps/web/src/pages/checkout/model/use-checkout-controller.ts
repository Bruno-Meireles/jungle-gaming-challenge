import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { useCart, useCartQuote, useRevalidateQuote, type CartQuote } from '../../../entities/cart';
import { usePlaceOrder, type PlaceOrderInput } from '../../../entities/order';
import { useSession } from '../../../entities/session';
import { useWallets } from '../../../entities/user';
import { clearPrivateSessionState } from '../../../features/auth';
import type { PickerWallet, WalletNetworkPickerProps } from '../../../features/wallet-connect';
import { NETWORK_IDS, type NetworkId } from '../../../shared/api/contracts/ids';
import type { CheckoutController, PlaceOrderResult, QuoteState } from '../../../widgets/checkout';
import { useCollectorState } from './collector-state';
import { useWalletConnection } from './wallet-connection';

type LineRef = { lineId: string; tokenId: string; title: string };
type Collector = ReturnType<typeof useCollectorState>;
type Connection = ReturnType<typeof useWalletConnection>;

function toQuoteState(quote: CartQuote | undefined, status: 'pending' | 'error' | 'success', lines: LineRef[]): QuoteState {
  if (!quote) return status === 'error' ? { status: 'error' } : { status: 'loading' };
  const byId = new Map(lines.map((l) => [l.lineId, l]));
  return {
    status: 'ready',
    quote: {
      hash: quote.quoteHash,
      lines: quote.lines.map((l) => ({
        tokenId: byId.get(l.lineId)?.tokenId ?? l.lineId,
        title: byId.get(l.lineId)?.title ?? '',
        quantity: l.quantity,
        unitPriceEth: l.unitPrice,
        lineTotalEth: l.lineTotal,
      })),
      subtotalEth: quote.subtotal,
      discountEth: quote.discount,
      networkFeeEth: quote.networkFee,
      totalEth: quote.total,
      canCheckout: quote.canCheckout,
    },
  };
}

const REASONS = {
  quote_changed: 'quote_changed',
  availability_conflict: 'unavailable',
  idempotency_conflict: 'idempotency_conflict',
  session_expired: 'session_expired',
  validation: 'validation',
  network: 'recovery_exhausted',
  unexpected: 'unexpected',
} as const;

function useWalletPicker(collector: Collector, wallet: Connection, networkLabels: Record<NetworkId, string>): WalletNetworkPickerProps {
  const wallets = useWallets();
  const pickerWallets: PickerWallet[] = (wallets.data?.wallets ?? []).map((w) => ({
    id: w.id,
    kind: w.kind,
    networkId: w.network,
    address: w.address,
    nickname: null,
  }));
  return {
    networks: NETWORK_IDS.map((id) => ({ id, label: networkLabels[id] })),
    wallets: pickerWallets,
    networkId: collector.networkId,
    walletId: collector.walletId,
    connection: wallet.connection,
    onNetworkChange: (next) => {
      const parsed = NETWORK_IDS.find((n) => n === next);
      if (!parsed) return;
      collector.setNetworkId(parsed);
      collector.setWalletId(null);
      wallet.reset();
    },
    onWalletSelect: collector.setWalletId,
    onConnect: (id) => wallet.connect(id, collector.networkId),
    onChangeWallet: wallet.disconnect,
  };
}

type Valid = Extract<Collector['validation'], { ok: true }>['value'];

function buildOrderInput(
  value: Valid,
  base: { quoteHash: string; networkId: NetworkId; walletId: string; lines: { lineId: string; quantity: number }[] },
  connection: Connection['connection'],
): PlaceOrderInput {
  const { secondaryWalletOrEns, note, ...rest } = value;
  return {
    ...base,
    ...(connection.connectionId ? { connectionId: connection.connectionId } : {}),
    ...(connection.provider ? { walletProvider: connection.provider } : {}),
    collector: { ...rest, ...(secondaryWalletOrEns ? { secondaryWalletOrEns } : {}), ...(note ? { note } : {}) },
  };
}

/** Adaptador fino: liga carrinho, cotacao, carteiras, conexao e pedido as portas da UI de checkout. */
export function useCheckoutController(networkLabels: Record<NetworkId, string>) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const session = useSession();
  const collector = useCollectorState(session.data?.status === 'authenticated' ? session.data.user : null);
  const connection = useWalletConnection();
  const cart = useCart();
  const quote = useCartQuote({ networkId: collector.networkId });
  const revalidateQuote = useRevalidateQuote();
  const { placeOrder } = usePlaceOrder();
  const cartLines = cart.data?.lines ?? [];

  const submit = async ({ quoteHash, onRecovering }: { quoteHash: string; onRecovering: () => void }): Promise<PlaceOrderResult> => {
    const { validation, walletId, networkId } = collector;
    if (!validation.ok) {
      collector.revealErrors(validation.errors);
      return { ok: false, reason: 'validation' };
    }
    if (connection.connection.status !== 'connected' || !walletId) return { ok: false, reason: 'wallet_disconnected' };
    const lines = cartLines.map((l) => ({ lineId: l.lineId, quantity: l.quantity }));
    const input = buildOrderInput(validation.value, { quoteHash, networkId, walletId, lines }, connection.connection);
    const result = await placeOrder(input, { onRecovering });
    if (!result.ok) return { ok: false, reason: REASONS[result.failure.kind] };
    collector.clearDraft();
    return { ok: true, orderId: result.value.orderId };
  };

  const controller: CheckoutController = {
    formValid: collector.validation.ok,
    connection: connection.connection,
    network: collector.networkId,
    quote: toQuoteState(quote.data, quote.status, cartLines),
    revalidate: async () => {
      const fresh = await revalidateQuote(collector.networkId);
      return { hash: fresh.quoteHash, canCheckout: fresh.canCheckout };
    },
    placeOrder: submit,
  };

  return {
    form: collector.form,
    wallet: useWalletPicker(collector, connection, networkLabels),
    controller,
    cartEmpty: cart.isSuccess && !cart.isFetching && cartLines.length === 0,
    onPlaced: (orderId: string) => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      void navigate({ to: '/orders/$orderId', params: { orderId } });
    },
    onSessionExpired: () => {
      clearPrivateSessionState(queryClient);
      void navigate({ to: '/login', search: { redirect: '/checkout' } });
    },
  };
}
