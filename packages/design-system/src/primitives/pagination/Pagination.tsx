export type PaginationProps = React.ComponentProps<'nav'> & {
  page: number;
  pageCount: number;
  getItemProps?: (page: number) => React.ComponentProps<'a'>;
};

export function Pagination(props: PaginationProps) {
  void props;
  return null;
}
