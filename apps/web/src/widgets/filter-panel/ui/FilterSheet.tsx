import { Button, Sheet } from '@jg/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FiltersIcon } from '../../../shared/ui';
import { FilterSheetContent } from './FilterSheetContent';

/** Abaixo de 1440: botao "Filtros" abre um Sheet com rascunho; so "Aplicar" grava na URL. */
export function FilterSheet({ className = '' }: { className?: string }) {
  const { t } = useTranslation('filters');
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <Button
        aria-label={t('label')}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="size-45 rounded-12 bg-linear-to-br from-primary-light to-primary"
        onClick={() => setOpen(true)}
      >
        <FiltersIcon />
      </Button>
      <Sheet side="bottom" open={open} onOpenChange={setOpen} contentProps={{ 'aria-describedby': undefined }}>
        <FilterSheetContent onClose={() => setOpen(false)} />
      </Sheet>
    </div>
  );
}
