import { Outlet, useNavigate } from '@tanstack/react-router';

import { useLogout } from '../../../features/auth';
import { AccountNav } from '../../../widgets/account-nav';
import { PageContainer } from '../../../shared/ui';

export function AccountLayout() {
  const navigate = useNavigate();
  const logout = useLogout();
  const onLogout = () => logout.mutate(undefined, { onSettled: () => void navigate({ to: '/' }) });
  return (
    <PageContainer className="flex flex-col gap-24 pt-16 pb-24 desktop:flex-row desktop:gap-28 desktop:pt-32">
      <AccountNav onLogout={onLogout} />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </PageContainer>
  );
}
