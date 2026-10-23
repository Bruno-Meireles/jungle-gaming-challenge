import { z } from 'zod';

import { httpClient, sendJson, type HttpClient } from '../../../shared/api/http-client';

const connectionSchema = z.object({ connectionId: z.string().min(1), provider: z.string().min(1) });
export type WalletConnection = z.infer<typeof connectionSchema>;

/** Conexao simulada pela API: responde 403 `forbidden` quando a carteira recusa. */
export function connectWallet(walletId: string, client: HttpClient = httpClient): Promise<WalletConnection> {
  return sendJson(client, { method: 'post', path: '/wallet/connect', body: { walletId }, schema: connectionSchema });
}

export function disconnectWallet(client: HttpClient = httpClient): Promise<undefined> {
  return sendJson(client, { method: 'delete', path: '/wallet/connect', schema: z.undefined() });
}
