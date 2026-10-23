import { z } from 'zod';

import { PASSWORD_MIN_LENGTH, USERNAME_PATTERN } from '../../../shared/api/contracts/auth';

/** Mensagens sao codigos (sem texto): a traducao e da UI. */
export type FormErrorCode = 'required' | 'invalid_email' | 'too_short' | 'invalid_username' | 'password_mismatch';

const requiredText = z.string().min(1, { error: 'required', abort: true });
const email = requiredText.refine((v) => z.email().safeParse(v).success, { error: 'invalid_email' });

export const loginFormSchema = z.object({ email, password: requiredText });
export type LoginFormSchemaValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    username: requiredText.regex(USERNAME_PATTERN, { error: 'invalid_username' }),
    email,
    password: requiredText.min(PASSWORD_MIN_LENGTH, { error: 'too_short' }),
    confirmPassword: requiredText,
  })
  .check((ctx) => {
    const { password, confirmPassword } = ctx.value;
    const passwordOk = password.length >= PASSWORD_MIN_LENGTH;
    if (passwordOk && confirmPassword.length > 0 && password !== confirmPassword) {
      ctx.issues.push({
        code: 'custom',
        input: confirmPassword,
        path: ['confirmPassword'],
        message: 'password_mismatch',
      });
    }
  });
export type RegisterFormSchemaValues = z.infer<typeof registerFormSchema>;

const FORM_ERROR_CODES: readonly string[] = [
  'required',
  'invalid_email',
  'too_short',
  'invalid_username',
  'password_mismatch',
];

function isFormErrorCode(value: string): value is FormErrorCode {
  return FORM_ERROR_CODES.includes(value);
}

/** Primeiro codigo de erro por campo. */
export function fieldErrorsFromZod(error: z.ZodError): Record<string, FormErrorCode> {
  const result: Record<string, FormErrorCode> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in result) && isFormErrorCode(issue.message)) {
      result[key] = issue.message;
    }
  }
  return result;
}
