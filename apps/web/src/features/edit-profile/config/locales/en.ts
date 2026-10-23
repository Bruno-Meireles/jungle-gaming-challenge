import type { ptBR } from './pt-BR';

export const en = {
  fields: {
    displayName: 'Display name',
    username: 'Username',
    email: 'Email',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
  },
  avatar: {
    alt: 'Profile picture',
    change: 'Change',
    remove: 'Remove',
  },
  actions: {
    save: 'Save',
    retry: 'Try again',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  messages: {
    saved: 'Profile updated',
    loadFailed: 'Could not load the profile.',
    network: 'Could not connect. Check your connection.',
    unexpected: 'Something went wrong. Please try again later.',
  },
  errors: {
    required: 'This field is required',
    invalid_email: 'Enter a valid email address',
    invalid_username: 'Use 3 to 20 letters, numbers or underscores',
    too_long: 'Use at most 60 characters',
    too_short: 'Use at least 8 characters',
    password_mismatch: 'Passwords do not match',
    same_password: 'The new password must differ from the current one',
    email_taken: 'This email is already in use',
    username_taken: 'This username is already taken',
    wrong_current: 'Incorrect current password',
    invalid: 'Invalid value',
    avatar_invalid_type: 'Use a PNG, JPEG or WebP image',
    avatar_too_large: 'The image is too large',
  },
} satisfies typeof ptBR;
