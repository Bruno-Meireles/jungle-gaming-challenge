/*
 * Porta de saida do mock de comercio para o tempo real: o servidor Socket.IO simulado (mocks/realtime)
 * assina estes avisos e publica nft.updated / order.updated. O estado REST e a fonte; o aviso so informa a mudanca.
 */
export type CommerceChange =
  | { type: 'nft'; nftId: string }
  | { type: 'order'; orderId: string; userId: string };

type Listener = (change: CommerceChange) => void;

const listeners = new Set<Listener>();

export function onCommerceChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function emitCommerceChange(change: CommerceChange): void {
  for (const listener of [...listeners]) listener(change);
}
