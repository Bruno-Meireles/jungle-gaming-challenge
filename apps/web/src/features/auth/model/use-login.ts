import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { SessionUser } from '../../../shared/api/contracts/auth';
import type { AuthFailure } from './auth-failure';
import type { LoginFormSchemaValues } from './auth-form-schema';
import { signIn } from './auth-operations';

/** Nao navega: a UI decide o destino. */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<SessionUser, AuthFailure, LoginFormSchemaValues>({
    mutationFn: (values) => signIn(queryClient, values),
  });
}
