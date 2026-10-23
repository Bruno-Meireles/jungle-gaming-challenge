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
    <Button variant="outline" aria-pressed={favorited} onClick={handleClick}>
      <HeartIcon />
      {t('label')}
    </Button>
  );
}
