import { useQuery } from '@tanstack/react-query';

import { fetchProfile } from '../../../entities/user';

export const PROFILE_KEY = ['account', 'profile'] as const;

export function useProfileQuery() {
  return useQuery({ queryKey: PROFILE_KEY, queryFn: ({ signal }) => fetchProfile(undefined, signal) });
}
