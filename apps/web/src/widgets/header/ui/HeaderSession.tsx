import { Button } from '@jg/design-system';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useSession } from '../../../entities/session';
import { useLogout } from '../../../features/auth';
import { LoginIcon, UserIcon } from '../../../shared/ui';

const BUTTON = 'h-35 gap-4 rounded-6 px-9 text-body-large-16-medium-lh-16';

/** Entrar (visitante) ou Conta + Sair (autenticado). */
export function HeaderSession() {
  const { t } = useTranslation('header');
  const session = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  if (session.data?.status === 'authenticated') {
    return (
      <>
        <Button asChild variant="outline" className={BUTTON}>
          <Link to="/account/profile">
            <UserIcon />
            <span className="sr-only desktop:not-sr-only">{session.data.user.displayName}</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="h-35 px-4"
          disabled={logout.isPending}
          onClick={() => logout.mutate(undefined, { onSettled: () => void navigate({ to: '/' }) })}
        >
          {t('logout')}
        </Button>
      </>
    );
  }
  return (
    <Button asChild className={BUTTON}>
      <Link to="/login">
        <LoginIcon />
        {t('login')}
      </Link>
    </Button>
  );
}
