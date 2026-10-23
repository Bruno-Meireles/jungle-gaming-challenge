export type CollectorValues = {
  displayName: string;
  email: string;
  username: string;
  profileName: string;
  referralCode: string;
  ensName: string;
  secondaryWalletOrEns: string;
  note: string;
};

export type CollectorField = keyof CollectorValues;
export type CollectorErrorCode = 'required' | 'invalid_email' | 'invalid_username' | 'invalid_ens' | 'too_long';
export type CollectorErrors = Partial<Record<CollectorField, CollectorErrorCode>>;

export type CollectorData = Omit<CollectorValues, 'secondaryWalletOrEns' | 'note'> & {
  secondaryWalletOrEns: string | null;
  note: string | null;
};

export type CollectorResult = { ok: true; value: CollectorData } | { ok: false; errors: CollectorErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME = /^[A-Za-z0-9_.-]+$/;
const ENS = /^[a-z0-9-]{3,63}$/;
const FIELDS: readonly CollectorField[] = ['displayName', 'email', 'username', 'profileName', 'referralCode', 'ensName', 'secondaryWalletOrEns', 'note'];
const REQUIRED: readonly CollectorField[] = ['displayName', 'email', 'username', 'profileName', 'referralCode', 'ensName'];
const MAX: Partial<Record<CollectorField, number>> = { note: 280, referralCode: 32 };
const PATTERNS: Partial<Record<CollectorField, [RegExp, CollectorErrorCode]>> = {
  email: [EMAIL, 'invalid_email'],
  username: [USERNAME, 'invalid_username'],
  ensName: [ENS, 'invalid_ens'],
};

function fieldError(field: CollectorField, value: string): CollectorErrorCode | null {
  if (value === '') return REQUIRED.includes(field) ? 'required' : null;
  const rule = PATTERNS[field];
  if (rule && !rule[0].test(value)) return rule[1];
  const max = MAX[field];
  return max !== undefined && value.length > max ? 'too_long' : null;
}

export function validateCollector(input: CollectorValues): CollectorResult {
  const trimmed: CollectorValues = {
    displayName: input.displayName.trim(),
    email: input.email.trim(),
    username: input.username.trim(),
    profileName: input.profileName.trim(),
    referralCode: input.referralCode.trim(),
    ensName: input.ensName.trim(),
    secondaryWalletOrEns: input.secondaryWalletOrEns.trim(),
    note: input.note.trim(),
  };
  const errors: CollectorErrors = {};
  for (const field of FIELDS) {
    const code = fieldError(field, trimmed[field]);
    if (code) errors[field] = code;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: { ...trimmed, secondaryWalletOrEns: trimmed.secondaryWalletOrEns || null, note: trimmed.note || null },
  };
}
