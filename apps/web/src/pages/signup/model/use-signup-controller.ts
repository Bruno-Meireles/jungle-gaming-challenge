import { useRouter } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import {
  fieldErrorsFromZod,
  registerFormSchema,
  useRegister,
  type SignupFormProps,
  type SignupFormValues,
} from '../../../features/auth';
import { safeRedirect } from '../../../shared/lib/navigation/safe-redirect';

type FieldErrors = NonNullable<SignupFormProps['fieldErrors']>;
type FieldErrorCode = FieldErrors[keyof FieldErrors];

// O formulario so traduz estes codigos; os demais da validacao (too_short, invalid_username) caem em 'required'.
function toFieldErrors(error: Parameters<typeof fieldErrorsFromZod>[0]): FieldErrors {
  const result: Record<string, FieldErrorCode> = {};
  for (const [key, code] of Object.entries(fieldErrorsFromZod(error))) {
    result[key] = code === 'invalid_email' || code === 'password_mismatch' ? code : 'required';
  }
  return result;
}

/** Adaptador fino: liga useRegister ao SignupForm, valida no cliente e navega no sucesso. */
export function useSignupController(redirect?: string) {
  const router = useRouter();
  const mutation = useRegister();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const last = useRef<SignupFormValues | null>(null);

  const submit = (values: SignupFormValues) => {
    const parsed = registerFormSchema.safeParse(values);
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
  const failure: SignupFormProps['failure'] =
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
