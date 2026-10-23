import type { LineNotice } from './domain/cart';

/** Precos vistos por linha (so memoria: o aviso some ao recarregar). */
const seen = new Map<string, string>();

export const seenPrices: ReadonlyMap<string, string> = seen;

export function rememberPrices(lines: { lineId: string; unitPrice: string }[]): void {
  for (const l of lines) if (!seen.has(l.lineId)) seen.set(l.lineId, l.unitPrice);
}

/** Editar/remover linha reconhece o preco atual: o aviso some. */
export function forgetPrices(): void {
  seen.clear();
}

export const noApiNotices: ReadonlyMap<string, LineNotice> = new Map();
