import type { OrderStatus } from './order';

/** Confirmado e recusado sao terminais: nenhum evento posterior os altera. */
export function isTerminalStatus(status: OrderStatus): boolean {
  return status === 'confirmed' || status === 'refused';
}

/** Versao maior vence; duplicatas e eventos antigos sao ignorados; terminais nao regridem. */
export function shouldApplyOrderUpdate(
  known: { status: OrderStatus; version: number } | undefined,
  incoming: { status: OrderStatus; version: number },
): boolean {
  if (!known) return true;
  if (isTerminalStatus(known.status)) return false;
  return incoming.version > known.version;
}

export function fingerprintOf(value: unknown): string {
  const text = JSON.stringify(value);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
}
