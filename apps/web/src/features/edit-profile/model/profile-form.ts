import type { ChangePasswordRequest, UpdateProfileRequest } from '../../../shared/api/contracts/account';

export type ProfileFormValues = {
  displayName: string;
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ProfileFieldName = keyof ProfileFormValues;
export type ProfileErrorCode =
  | 'required'
  | 'invalid_email'
  | 'invalid_username'
  | 'too_long'
  | 'too_short'
  | 'password_mismatch'
  | 'same_password';
export type ProfileFormErrors = Partial<Record<ProfileFieldName, ProfileErrorCode>>;

const MAX_DISPLAY_NAME = 60;
const MIN_PASSWORD = 8;
const USERNAME = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hasPasswordChange(v: ProfileFormValues): boolean {
  return v.currentPassword !== '' || v.newPassword !== '' || v.confirmPassword !== '';
}

function validateText(value: string, pattern: RegExp | null, invalid: ProfileErrorCode): ProfileErrorCode | undefined {
  const text = value.trim();
  if (text === '') return 'required';
  return pattern && !pattern.test(text) ? invalid : undefined;
}

function validateDisplayName(value: string): ProfileErrorCode | undefined {
  const text = value.trim();
  if (text === '') return 'required';
  return text.length > MAX_DISPLAY_NAME ? 'too_long' : undefined;
}

function validateNewPassword(v: ProfileFormValues): ProfileErrorCode | undefined {
  if (v.newPassword === '') return 'required';
  if (v.newPassword.length < MIN_PASSWORD) return 'too_short';
  return v.newPassword === v.currentPassword ? 'same_password' : undefined;
}

function validateConfirm(v: ProfileFormValues): ProfileErrorCode | undefined {
  if (v.confirmPassword === '') return 'required';
  return v.newPassword !== '' && v.confirmPassword !== v.newPassword ? 'password_mismatch' : undefined;
}

function validatePasswords(v: ProfileFormValues): ProfileFormErrors {
  if (!hasPasswordChange(v)) return {};
  return {
    ...(v.currentPassword === '' ? { currentPassword: 'required' as const } : {}),
    ...pick('newPassword', validateNewPassword(v)),
    ...pick('confirmPassword', validateConfirm(v)),
  };
}

function pick(field: ProfileFieldName, code: ProfileErrorCode | undefined): ProfileFormErrors {
  return code ? { [field]: code } : {};
}

export function validateProfileForm(v: ProfileFormValues): ProfileFormErrors {
  return {
    ...pick('displayName', validateDisplayName(v.displayName)),
    ...pick('username', validateText(v.username, USERNAME, 'invalid_username')),
    ...pick('email', validateText(v.email, EMAIL, 'invalid_email')),
    ...validatePasswords(v),
  };
}

export function toRequests(
  v: ProfileFormValues,
  avatarUrl: string | null,
): { profile: UpdateProfileRequest; password: ChangePasswordRequest | null } {
  return {
    profile: { displayName: v.displayName.trim(), username: v.username.trim(), email: v.email.trim(), avatarUrl },
    password: hasPasswordChange(v) ? { currentPassword: v.currentPassword, newPassword: v.newPassword } : null,
  };
}
