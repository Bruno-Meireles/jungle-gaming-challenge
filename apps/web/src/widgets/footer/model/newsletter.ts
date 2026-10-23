export type NewsletterError = 'required' | 'invalid';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateNewsletterEmail(value: string): NewsletterError | null {
  const email = value.trim();
  if (email === '') return 'required';
  return EMAIL.test(email) ? null : 'invalid';
}
