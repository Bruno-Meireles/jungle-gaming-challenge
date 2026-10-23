import type { QueryClient } from '@tanstack/react-query';

import { cartKeys } from '../../../entities/cart';
import { authenticated, sessionKeys, writeToken } from '../../../entities/session';
import { login, register } from '../../../entities/user';
import type { AuthResponse, SessionUser } from '../../../shared/api/contracts/auth';
import type { HttpClient } from '../../../shared/api/http-client';
import { toAuthFailure } from './auth-failure';
import type { LoginFormSchemaValues, RegisterFormSchemaValues } from './auth-form-schema';

function applyAuthenticated(queryClient: QueryClient, auth: AuthResponse): SessionUser {
  writeToken(auth.token);
  queryClient.setQueryData(sessionKeys.current(), authenticated(auth.user));
  void queryClient.invalidateQueries({ queryKey: cartKeys.all });
  return auth.user;
}

async function complete(promise: Promise<AuthResponse>, queryClient: QueryClient): Promise<SessionUser> {
  try {
    return applyAuthenticated(queryClient, await promise);
  } catch (error) {
    return Promise.reject(toAuthFailure(error));
  }
}

export function signIn(queryClient: QueryClient, values: LoginFormSchemaValues, client?: HttpClient) {
  return complete(login({ email: values.email, password: values.password }, client), queryClient);
}

/** Desvio do Figma: nao ha campo de nome; displayName = username (ARCHITECTURE.md). */
export function signUp(queryClient: QueryClient, values: RegisterFormSchemaValues, client?: HttpClient) {
  return complete(
    register(
      { displayName: values.username, username: values.username, email: values.email, password: values.password },
      client,
    ),
    queryClient,
  );
}
