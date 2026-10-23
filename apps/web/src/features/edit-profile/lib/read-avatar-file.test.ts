import { describe, expect, it } from 'vitest';

import { readAvatarFile } from './read-avatar-file';

describe('readAvatarFile', () => {
  it('png pequeno vira data URL', async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'a.png', { type: 'image/png' });
    const result = await readAvatarFile(file);
    expect(result).toEqual({ ok: true, dataUrl: expect.stringMatching(/^data:image\/png;base64,/) });
  });
  it('tipo nao suportado: avatar_invalid_type', async () => {
    const result = await readAvatarFile(new File(['x'], 'a.gif', { type: 'image/gif' }));
    expect(result).toEqual({ ok: false, error: 'avatar_invalid_type' });
  });
  it('data URL acima de 300000: avatar_too_large', async () => {
    const big = new File([new Uint8Array(250_000)], 'a.webp', { type: 'image/webp' });
    expect(await readAvatarFile(big)).toEqual({ ok: false, error: 'avatar_too_large' });
  });
});
