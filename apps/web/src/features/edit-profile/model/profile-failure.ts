import type { FormFailure } from '../../../shared/lib/form';
import type { ProfileFieldName } from './profile-form';

export type ServerErrorCode = 'email_taken' | 'username_taken' | 'wrong_current' | 'invalid';
export type ServerErrors = Partial<Record<ProfileFieldName, ServerErrorCode>>;
export type ProfileServerFailure = 'network' | 'unexpected' | null;
export type FailureState = { errors: ServerErrors; failure: ProfileServerFailure; sessionExpired: boolean };

const NONE: FailureState = { errors: {}, failure: null, sessionExpired: false };

function fromConflict(fields: string[]): FailureState {
  const errors: ServerErrors = {};
  if (fields.includes('email')) errors.email = 'email_taken';
  if (fields.includes('username')) errors.username = 'username_taken';
  return { ...NONE, errors };
}

function fromValidation(fields: string[]): FailureState {
  const errors: ServerErrors = {};
  if (fields.includes('currentPassword')) errors.currentPassword = 'wrong_current';
  if (fields.includes('displayName')) errors.displayName = 'invalid';
  if (fields.includes('username')) errors.username = 'invalid';
  if (fields.includes('email')) errors.email = 'invalid';
  return Object.keys(errors).length > 0 ? { ...NONE, errors } : { ...NONE, failure: 'unexpected' };
}

export function toFailureState(failure: FormFailure): FailureState {
  switch (failure.kind) {
    case 'session_expired':
      return { ...NONE, sessionExpired: true };
    case 'conflict':
      return fromConflict(failure.fields);
    case 'validation':
      return fromValidation(failure.fields);
    case 'network':
      return { ...NONE, failure: 'network' };
    default:
      return { ...NONE, failure: 'unexpected' };
  }
}
