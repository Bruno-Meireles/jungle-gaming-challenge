import type { AxiosResponse } from 'axios';
import type { ZodType } from 'zod';

import { ApiError } from './api-error';
import { type HttpClient, normalizeError } from './http-client';

export interface SendJsonRequest<T> {
  method: 'post' | 'put' | 'patch' | 'delete';
  path: string;
  schema: ZodType<T>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/** Mutacao JSON tipada: normaliza erros de transporte em ApiError e valida a resposta com zod. */
export async function sendJson<T>(client: HttpClient, req: SendJsonRequest<T>): Promise<T> {
  let response: AxiosResponse<unknown>;
  try {
    response = await client.request<unknown>({
      method: req.method,
      url: req.path,
      data: req.body,
      headers: req.headers,
      signal: req.signal,
      timeout: req.timeoutMs,
    });
  } catch (error) {
    throw normalizeError(error);
  }
  const parsed = req.schema.safeParse(response.data);
  if (!parsed.success) {
    throw new ApiError({ status: response.status, code: 'invalid_response', transient: false });
  }
  return parsed.data;
}
