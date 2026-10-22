import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useCanonicalSearchUrl, useCatalogQuery, useCatalogSearch } from '../../../entities/nft';
import { CatalogPagination } from './CatalogPagination';
import { CatalogResults } from './CatalogResults';
import { CatalogToolbar } from './CatalogToolbar';

/** Resultados do catalogo: a URL manda; pagina acima do total e corrigida por `replace` (sem entrada no historico). */
export function Catalog() {
  const { t } = useTranslation('catalog');
  const { search, update, hrefFor } = useCatalogSearch();
  const query = useCatalogQuery(search);
  const { data, isPlaceholderData } = query;
  useCanonicalSearchUrl();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const requested = search.page;
  const served = data?.page;
  useEffect(() => {
    if (isPlaceholderData || requested === undefined || served === undefined) return;
    if (served < requested) update({ page: served }, { replace: true });
    // O guard acima torna o efeito inerte depois da correcao (a pagina pedida passa a ser a servida).
  }, [isPlaceholderData, requested, served, update]);

  return (
    <section aria-labelledby="catalog-title">
      <h2 id="catalog-title" ref={headingRef} tabIndex={-1} className="sr-only outline-none">
        {t('title')}
      </h2>
      <CatalogToolbar />
      <CatalogResults query={query} />
      <CatalogPagination
        page={data?.page ?? search.page ?? 1}
        pageCount={data?.totalPages ?? 0}
        getHref={(page) => hrefFor({ page })}
        onPageChange={(page) => {
          update({ page });
          headingRef.current?.focus();
        }}
      />
    </section>
  );
}
