import { Button } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import { DeleteIcon } from '../../../shared/ui';

export function RemoveLineButton({ title, disabled = false, onRemove }: { title: string; disabled?: boolean; onRemove: () => void }) {
  const { t } = useTranslation('cartLineControls');
  return (
    <Button variant="icon" aria-label={t('remove', { title })} disabled={disabled} onClick={onRemove}>
      <DeleteIcon />
    </Button>
  );
}
