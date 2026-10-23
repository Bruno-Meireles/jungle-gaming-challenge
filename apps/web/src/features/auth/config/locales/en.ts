import type { ptBR } from './pt-BR';

export const en = {
  fields: {
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
  },
  actions: {
    login: 'Sign in',
    signup: 'Create account',
    forgot: 'Forgot password?',
    retry: 'Try again',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  social: {
    divider: 'Or continue with',
    unavailable: 'Social sign-in is unavailable in this demo',
  },
  errors: {
    field: {
      required: 'This field is required',
      invalid_email: 'Enter a valid email address',
      password_mismatch: 'Passwords do not match',
      email_taken: 'This email is already in use',
      username_taken: 'This username is already taken',
    },
    invalid_credentials: 'Incorrect email or password',
    account_conflict: 'We could not create the account with these details',
    network: 'Could not connect. Check your connection.',
    unexpected: 'Something went wrong. Please try again later.',
  },
} satisfies typeof ptBR;
