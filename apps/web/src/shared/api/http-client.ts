import axios, { type AxiosInstance, type AxiosResponse, isAxiosError, isCancel } from 'axios';
import type { ZodType } from 'zod';

import { ApiError } from './api-error';
import { SESSION_TOKEN_STORAGE_KEY } from './contracts/auth';
import { apiErrorBodySchema } from './contracts/error';

export type HttpClient = AxiosInstance;

function serializeValue(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function serializeEntry(key: string, value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  const pairs: string[] = [];
  for (const item of values) {
    const text = serializeValue(item);
    if (text !== null) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(text)}`);
    }
  }
  return pairs;
}

export function serializeParams(params: Record<string, unknown>): string {
  return Object.entries(params)
    .flatMap(([key, value]) => serializeEntry(key, value))
    .join('&');
}

function readStoredToken(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function createHttpClient(options?: { baseURL?: string }): HttpClient {
  const client = axios.create({
    baseURL: options?.baseURL ?? '/api',
    paramsSerializer: { serialize: serializeParams },
  });
  client.interceptors.request.use((config) => {
    const token = readStoredToken();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  });
  return client;
}

export interface GetJsonRequest<T> {
  path: string;
  schema: ZodType<T>;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

function normalizeResponseError(status: number, data: unknown): ApiError {
  const body = apiErrorBodySchema.safeParse(data);
  if (body.success) {
    return new ApiError({
      status,
      code: body.data.code,
      transient: body.data.code === 'service_unavailable' || body.data.code === 'internal_error',
      fieldErrors: body.data.fieldErrors,
      fields: body.data.fields,
      available: body.data.available,
    });
  }
  if (status >= 500) {
    return new ApiError({ status, code: 'internal_error', transient: true });
  }
  return new ApiError({ status, code: 'validation_failed', transient: false });
}

export function normalizeError(error: unknown): unknown {
  if (error instanceof ApiError || !isAxiosError(error)) {
    return error;
  }
  if (isCancel(error)) {
    return new ApiError({ status: null, code: 'aborted', transient: false });
  }
  if (!error.response) {
    return new ApiError({ status: null, code: 'network_error', transient: true });
  }
  return normalizeResponseError(error.response.status, error.response.data);
}

async function request<T>(client: HttpClient, req: GetJsonRequest<T>): Promise<AxiosResponse<unknown>> {
  try {
    return await client.get<unknown>(req.path, { params: req.params, signal: req.signal, headers: req.headers });
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getJson<T>(client: HttpClient, req: GetJsonRequest<T>): Promise<T> {
  const response = await request(client, req);
  const parsed = req.schema.safeParse(response.data);
  if (!parsed.success) {
    throw new ApiError({ status: response.status, code: 'invalid_response', transient: false });
  }
  return parsed.data;
}

export interface SendJsonRequest<T> {
  method: 'post' | 'put' | 'patch' | 'delete';
  path: string;
  body?: unknown;
  schema?: ZodType<T>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export function sendJson<T>(client: HttpClient, req: SendJsonRequest<T> & { schema: ZodType<T> }): Promise<T>;
export function sendJson(client: HttpClient, req: Omit<SendJsonRequest<never>, 'schema'>): Promise<undefined>;
export async function sendJson<T>(client: HttpClient, req: SendJsonRequest<T>): Promise<T | undefined> {
  let response: AxiosResponse<unknown>;
  try {
    response = await client.request<unknown>({
      method: req.method,
      url: req.path,
      data: req.body,
      headers: req.headers,
      signal: req.signal,
    });
  } catch (error) {
    throw normalizeError(error);
  }
  if (!req.schema) return undefined;
  const parsed = req.schema.safeParse(response.data);
  if (!parsed.success) {
    throw new ApiError({ status: response.status, code: 'invalid_response', transient: false });
  }
  return parsed.data;
}

export const httpClient = createHttpClient();
