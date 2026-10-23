import { describe, expect, it } from 'vitest';

import { fieldErrorsFromZod, loginFormSchema, registerFormSchema } from './auth-form-schema';

const validRegister = {
  username: 'ana_01',
  email: 'ana@example.test',
  password: 'Senha-Forte-1',
  confirmPassword: 'Senha-Forte-1',
};

function errors(schema: typeof registerFormSchema | typeof loginFormSchema, value: unknown) {
  const result = schema.safeParse(value);
  return result.success ? null : fieldErrorsFromZod(result.error);
}

describe('loginFormSchema', () => {
  it('aceita e-mail e senha', () => {
    expect(loginFormSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });

  it('campos vazios dao required (codigo, nao texto)', () => {
    expect(errors(loginFormSchema, { email: '', password: '' })).toEqual({ email: 'required', password: 'required' });
  });

  it('e-mail malformado da invalid_email', () => {
    expect(errors(loginFormSchema, { email: 'ana@', password: 'x' })).toEqual({ email: 'invalid_email' });
  });
});

describe('registerFormSchema', () => {
  it('aceita dados validos', () => {
    expect(registerFormSchema.safeParse(validRegister).success).toBe(true);
  });

  it('vazios dao required em todos', () => {
    expect(errors(registerFormSchema, { username: '', email: '', password: '', confirmPassword: '' })).toEqual({
      username: 'required',
      email: 'required',
      password: 'required',
      confirmPassword: 'required',
    });
  });

  it('username invalido, senha curta e e-mail invalido', () => {
    expect(
      errors(registerFormSchema, { ...validRegister, username: 'a b', email: 'x', password: '123', confirmPassword: '123' }),
    ).toEqual({ username: 'invalid_username', email: 'invalid_email', password: 'too_short' });
  });

  it('confirmacao diferente da senha da password_mismatch em confirmPassword', () => {
    expect(errors(registerFormSchema, { ...validRegister, confirmPassword: 'outra-senha-1' })).toEqual({
      confirmPassword: 'password_mismatch',
    });
  });

  it('nao acusa mismatch quando a senha ja e invalida (evita ruido)', () => {
    expect(errors(registerFormSchema, { ...validRegister, password: '123', confirmPassword: '12' })).toEqual({
      password: 'too_short',
    });
  });
});
