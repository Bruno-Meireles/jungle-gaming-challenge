import { MAX_AVATAR_LENGTH } from '../../../shared/api/contracts/account';

export const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp';
export type AvatarError = 'avatar_invalid_type' | 'avatar_too_large';
export type AvatarResult = { ok: true; dataUrl: string } | { ok: false; error: AvatarError };

export function readAvatarFile(file: File): Promise<AvatarResult> {
  if (!AVATAR_ACCEPT.split(',').includes(file.type)) {
    return Promise.resolve({ ok: false, error: 'avatar_invalid_type' });
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      resolve(
        dataUrl.length > MAX_AVATAR_LENGTH ? { ok: false, error: 'avatar_too_large' } : { ok: true, dataUrl },
      );
    };
    reader.onerror = () => resolve({ ok: false, error: 'avatar_invalid_type' });
    reader.readAsDataURL(file);
  });
}
