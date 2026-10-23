import { useMutation, useQueryClient } from '@tanstack/react-query';

import { changePassword, updateProfile } from '../../../entities/user';
import { sessionKeys } from '../../../entities/session';
import type { ChangePasswordRequest, UpdateProfileRequest } from '../../../shared/api/contracts/account';
import { PROFILE_KEY } from './use-profile-query';

/** Salva o perfil e, se houver, troca a senha em seguida (um unico "Salvar" na tela). */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    retry: 0,
    mutationFn: async (input: { profile: UpdateProfileRequest; password: ChangePasswordRequest | null }) => {
      const profile = await updateProfile(input.profile);
      queryClient.setQueryData(PROFILE_KEY, profile);
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      if (input.password) await changePassword(input.password);
      return profile;
    },
  });
}
