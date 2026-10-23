import type { ptBR } from './pt-BR';

export const en = {
  fields: {
    displayName: 'Display name',
    email: 'Email',
    username: 'Username',
    profileName: 'Profile name',
    referralCode: 'Referral code',
    ensName: 'ENS name',
    secondaryWalletOrEns: 'Secondary wallet or ENS (optional)',
    note: 'Note (optional)',
  },
  errors: {
    required: 'This field is required',
    invalid_email: 'Enter a valid email address',
    invalid_username: 'Use only letters, numbers, dots, hyphens and underscores',
    invalid_ens: 'Use 3 to 63 lowercase letters, numbers or hyphens',
    too_long: 'Text is too long',
  },
} satisfies typeof ptBR;
