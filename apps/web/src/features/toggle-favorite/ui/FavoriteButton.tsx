import { Button } from '@jg/design-system';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { HeartIcon } from '../../../shared/ui';

export type FavoriteButtonProps = {
  favorited: boolean;
  authenticated: boolean;
  /** Caminho interno (com search) para onde voltar depois do login. */
  redirectTo: string;
  onToggle: () => void;
};

export function FavoriteButton({ favorited, authenticated, redirectTo, onToggle }: FavoriteButtonProps) {
  const { t } = useTranslation('toggleFavorite');
  const navigate = useNavigate();
  const handleClick = () => {
    if (authenticated) onToggle();
    else void navigate({ to: '/login', search: { redirect: redirectTo } });
  };
  return (
    <Button
      variant="outline"
      aria-pressed={favorited}
      onClick={handleClick}
      className="size-60 rounded-40 px-0 tablet:h-40 tablet:w-auto tablet:rounded-6 tablet:px-13"
    >
      <HeartIcon />
      <span className="sr-only tablet:not-sr-only">{t('label')}</span>
    </Button>
  );
}
