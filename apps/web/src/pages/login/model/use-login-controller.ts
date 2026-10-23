import { useRouter } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import {
  fieldErrorsFromZod,
  loginFormSchema,
  useLogin,
  type LoginFormProps,
  type LoginFormValues,
} from '../../../features/auth';
import { safeRedirect } from '../../../shared/lib/navigation/safe-redirect';

type FieldErrors = NonNullable<LoginFormProps['fieldErrors']>;
type FieldErrorCode = FieldErrors[keyof FieldErrors];

// O formulario so traduz estes codigos; os demais da validacao (too_short, invalid_username) caem em 'required'.
function toFieldErrors(error: Parameters<typeof fieldErrorsFromZod>[0]): FieldErrors {
  const result: Record<string, FieldErrorCode> = {};
  for (const [key, code] of Object.entries(fieldErrorsFromZod(error))) {
    result[key] = code === 'invalid_email' || code === 'password_mismatch' ? code : 'required';
  }
  return result;
}

/** Adaptador fino: liga useLogin ao LoginForm, valida no cliente e navega no sucesso. */
export function useLoginController(redirect?: string) {
  const router = useRouter();
  const mutation = useLogin();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const last = useRef<LoginFormValues | null>(null);

  const submit = (values: LoginFormValues) => {
    const parsed = loginFormSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    last.current = parsed.data;
    mutation.mutate(parsed.data, {
      onSuccess: () => router.history.replace(safeRedirect(redirect)),
    });
  };

  const error = mutation.error;
  const failure: LoginFormProps['failure'] =
    error === null ? null : error.kind === 'validation' ? { kind: 'unexpected' } : error;

  return {
    submit,
    pending: mutation.isPending,
    failure,
    fieldErrors,
    retry: () => {
      if (last.current) submit(last.current);
    },
  };
}
