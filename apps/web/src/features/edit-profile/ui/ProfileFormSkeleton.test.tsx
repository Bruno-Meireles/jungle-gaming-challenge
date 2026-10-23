import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { mountAccount } from '../../../test-support/account';
import { ProfileFormSkeleton } from './ProfileFormSkeleton';

describe('ProfileFormSkeleton', () => {
  it('expoe aria-busy', async () => {
    const { screen } = await mountAccount('pt-BR', <ProfileFormSkeleton />);
    await expect.element(page.getByTestId('profile-form-skeleton')).toHaveAttribute('aria-busy', 'true');
    expect(screen).toBeDefined();
  });
});
