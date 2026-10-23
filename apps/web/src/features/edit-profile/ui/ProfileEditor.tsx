import { Alert, Button } from '@jg/design-system';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toFormFailure } from '../../../shared/lib/form';
import { toFailureState, type FailureState } from '../model/profile-failure';
import { toRequests, type ProfileFormValues } from '../model/profile-form';
import { useProfileQuery } from '../model/use-profile-query';
import { useUpdateProfile } from '../model/use-update-profile';
import { ProfileForm } from './ProfileForm';
import { ProfileFormSkeleton } from './ProfileFormSkeleton';

const CLEAN: FailureState = { errors: {}, failure: null, sessionExpired: false };

export function ProfileEditor() {
  const { t } = useTranslation('editProfile');
  const query = useProfileQuery();
  const update = useUpdateProfile();
  const navigate = useNavigate();
  const href = useRouterState({ select: (state) => state.location.href });
  const [state, setState] = useState<FailureState>(CLEAN);
  const [saved, setSaved] = useState(false);

  if (query.isPending) return <ProfileFormSkeleton />;
  if (query.isError) {
    return (
      <div className="flex flex-col items-start gap-16">
        <Alert tone="error" toneLabel="">
          {t('messages.loadFailed')}
        </Alert>
        <Button variant="outline" onClick={() => void query.refetch()}>
          {t('actions.retry')}
        </Button>
      </div>
    );
  }

  const submit = async (values: ProfileFormValues, avatarUrl: string | null): Promise<boolean> => {
    setState(CLEAN);
    setSaved(false);
    try {
      await update.mutateAsync(toRequests(values, avatarUrl));
      setSaved(true);
      return true;
    } catch (error) {
      const next = toFailureState(toFormFailure(error));
      setState(next);
      if (next.sessionExpired) void navigate({ to: '/login', search: { redirect: href } });
      return false;
    }
  };

  return (
    <ProfileForm
      profile={query.data}
      pending={update.isPending}
      saved={saved}
      serverErrors={state.errors}
      failure={state.failure}
      onSubmit={submit}
    />
  );
}
