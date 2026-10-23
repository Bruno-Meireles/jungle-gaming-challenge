import { Avatar, Button } from '@jg/design-system';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { AVATAR_ACCEPT, readAvatarFile, type AvatarError } from '../lib/read-avatar-file';

export type AvatarFieldProps = {
  value: string | null;
  initial: string;
  onChange: (dataUrl: string | null) => void;
};

export function AvatarField({ value, initial, onChange }: AvatarFieldProps) {
  const { t } = useTranslation('editProfile');
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<AvatarError | null>(null);

  const handleFile = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    if (!file) return;
    const result = await readAvatarFile(file);
    input.value = '';
    setError(result.ok ? null : result.error);
    if (result.ok) onChange(result.dataUrl);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-16">
        <Avatar
          src={value ?? undefined}
          alt={t('avatar.alt')}
          fallback={<span aria-hidden="true">{initial}</span>}
        />
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
          {t('avatar.change')}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" onClick={() => onChange(null)}>
            {t('avatar.remove')}
          </Button>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          data-testid="avatar-input"
          accept={AVATAR_ACCEPT}
          aria-hidden="true"
          tabIndex={-1}
          className="sr-only"
          onChange={(e: ChangeEvent<HTMLInputElement>) => void handleFile(e.target)}
        />
      </div>
      {error ? <p className="text-body-14-regular-lh-16 text-text-coral">{t(`errors.${error}`)}</p> : null}
    </div>
  );
}
