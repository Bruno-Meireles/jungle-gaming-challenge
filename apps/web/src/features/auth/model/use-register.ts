import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { SessionUser } from '../../../shared/api/contracts/auth';
import type { AuthFailure } from './auth-failure';
import type { RegisterFormSchemaValues } from './auth-form-schema';
import { signUp } from './auth-operations';

/** Nao navega: a UI decide o destino. */
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation<SessionUser, AuthFailure, RegisterFormSchemaValues>({
    mutationFn: (values) => signUp(queryClient, values),
  });
}
