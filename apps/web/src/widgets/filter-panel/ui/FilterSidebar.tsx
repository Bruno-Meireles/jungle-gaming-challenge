import { useTranslation } from 'react-i18next';

import { useCatalogQuery, useCatalogSearch } from '../../../entities/nft';
import { SidebarBody } from './SidebarBody';

/** Painel lateral (>= 1440): colecoes e redes valem na hora; o preco so ao clicar em "Aplicar". */
export function FilterSidebar() {
  const { t } = useTranslation('filters');
  const { search } = useCatalogSearch();
  const { data } = useCatalogQuery(search);
  const priceKey = [search.min ?? '', search.max ?? ''].join('-');
  return (
    <aside
      aria-label={t('label')}
      className="hidden w-310 shrink-0 self-start rounded-8 bg-surface-card p-20 desktop:block"
    >
      <SidebarBody key={priceKey} facets={data?.facets} />
    </aside>
  );
}
