import axios, { type AxiosInstance } from 'axios';
import type { ZodType } from 'zod';

export type HttpClient = AxiosInstance;

export function createHttpClient(options?: { baseURL?: string }): HttpClient {
  return axios.create({ baseURL: options?.baseURL ?? '/api' });
}

export interface GetJsonRequest<T> {
  path: string;
  schema: ZodType<T>;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
}

export async function getJson<T>(client: HttpClient, request: GetJsonRequest<T>): Promise<T> {
  const response = await client.get<T>(request.path, { params: request.params, signal: request.signal });
  return response.data;
}
