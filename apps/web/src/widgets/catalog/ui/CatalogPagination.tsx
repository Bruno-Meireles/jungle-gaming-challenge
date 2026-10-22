import { Pagination } from '@jg/design-system';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

type CatalogPaginationProps = {
  page: number;
  pageCount: number;
  getHref: (page: number) => string;
  onPageChange: (page: number) => void;
};

const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export function CatalogPagination({ page, pageCount, getHref, onPageChange }: CatalogPaginationProps) {
  const { t } = useTranslation('catalog');
  if (pageCount <= 1) return null;
  return (
    <Pagination
      label={t('pagination.label')}
      nextLabel={t('pagination.next')}
      page={page}
      pageCount={pageCount}
      className="mt-48 flex justify-center desktop:justify-end"
      getItemProps={(target) => ({
        href: getHref(target),
        onClick: (event) => {
          // Clique com modificador abre em nova aba pelo href real; o simples navega sem recarregar.
          if (!isPlainClick(event)) return;
          event.preventDefault();
          onPageChange(target);
        },
      })}
    />
  );
}
