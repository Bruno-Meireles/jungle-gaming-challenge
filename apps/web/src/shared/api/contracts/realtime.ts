import { z } from 'zod';

import { orderStatusSchema } from './commerce';
import { ethDecimalSchema } from './nfts';

/*
 * Eventos Socket.IO. Todo evento carrega identidade estavel (eventId), recurso afetado e versao.
 * O cliente ignora eventId ja visto e versoes <= a conhecida do recurso (duplicatas e eventos antigos).
 */
export const REALTIME_URL = 'wss://realtime.jungle.test';
export const REALTIME_EVENT_NAMES = ['nft.updated', 'order.updated'] as const;
/** Evento do cliente: identifica o usuario da conexao (token de sessao) para filtrar eventos privados. */
export const REALTIME_IDENTIFY_EVENT = 'session.identify';
export const realtimeIdentifyPayloadSchema = z.object({ token: z.string().min(1) });
export type RealtimeIdentifyPayload = z.infer<typeof realtimeIdentifyPayloadSchema>;

const envelope = {
  eventId: z.string().min(1),
  version: z.number().int().min(0),
  occurredAt: z.iso.datetime(),
};

export const nftUpdatedEventSchema = z.object({
  ...envelope,
  type: z.literal('nft.updated'),
  resource: z.object({ type: z.literal('nft'), id: z.string().min(1) }),
  data: z.object({
    /** Preco da edicao padrao (o mesmo exibido no catalogo). */
    priceEth: ethDecimalSchema,
    editions: z.array(
      z.object({
        id: z.string().min(1),
        priceEth: ethDecimalSchema,
        remaining: z.number().int().min(0),
      }),
    ),
  }),
});

export const orderUpdatedEventSchema = z.object({
  ...envelope,
  type: z.literal('order.updated'),
  resource: z.object({ type: z.literal('order'), id: z.string().min(1) }),
  /** Dono do pedido: o servidor so entrega a conexoes identificadas como este usuario. */
  userId: z.string().min(1),
  data: z.object({ status: orderStatusSchema, transactionRef: z.string().nullable() }),
});

export const realtimeEventSchema = z.discriminatedUnion('type', [
  nftUpdatedEventSchema,
  orderUpdatedEventSchema,
]);

export type NftUpdatedEvent = z.infer<typeof nftUpdatedEventSchema>;
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEventSchema>;
export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;
