import { Button, SheetClose, SheetTitle } from '@jg/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCatalogQuery, useCatalogSearch } from '../../../entities/nft';
import { CatalogFilters, type FilterValue } from '../../../features/catalog-filters';
import { CatalogSort } from '../../../features/catalog-sort';
import type { SortId } from '../../../shared/api/contracts/ids';

// Montado so com o Sheet aberto (Portal do Radix): o rascunho nasce da URL a cada abertura.
export function FilterSheetContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('filters');
  const { search, update } = useCatalogSearch();
  const { data } = useCatalogQuery(search);
  const [draft, setDraft] = useState<FilterValue>({
    collections: search.collections ?? [],
    networks: search.networks ?? [],
    min: search.min,
    max: search.max,
  });
  const [sort, setSort] = useState<SortId>(search.sort ?? 'recent');
  const apply = (): void => {
    update({ ...draft, sort });
    onClose();
  };
  return (
    <div className="flex flex-col gap-24">
      <SheetTitle className="m-0 text-body-large-18-bold-lh-16 text-foreground">{t('label')}</SheetTitle>
      <SheetClose closeLabel={t('close')} />
      <CatalogFilters facets={data?.facets} value={draft} onChange={(patch) => setDraft({ ...draft, ...patch })} />
      <CatalogSort variant="field" value={sort} onChange={setSort} />
      <Button size="block" onClick={apply}>
        {t('apply')}
      </Button>
    </div>
  );
}
