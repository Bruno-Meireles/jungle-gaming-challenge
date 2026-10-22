import { PaginationLink } from './PaginationLink';

export type PaginationProps = React.ComponentProps<'nav'> & {
  page: number;
  pageCount: number;
  getItemProps?: (page: number) => React.ComponentProps<'a'>;
};

const NextIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6.75 3.75 11.25 9l-4.5 5.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Pagination({ page, pageCount, getItemProps, ...props }: PaginationProps) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const isLast = page >= pageCount;
  return (
    <nav aria-label="Paginação" data-slot="pagination" {...props}>
      <ul className="m-0 flex list-none items-center gap-8 p-0">
        {pages.map((n) => (
          <li key={n}>
            <PaginationLink {...getItemProps?.(n)} aria-current={n === page ? 'page' : undefined}>
              {n}
            </PaginationLink>
          </li>
        ))}
        <li>
          {isLast ? (
            <PaginationLink role="link" aria-label="Próxima" aria-disabled="true">
              <NextIcon />
            </PaginationLink>
          ) : (
            <PaginationLink {...getItemProps?.(page + 1)} aria-label="Próxima">
              <NextIcon />
            </PaginationLink>
          )}
        </li>
      </ul>
    </nav>
  );
}
