/*
 * Medidas: Pagination 70342:2825 (docs/figma/file.json). Item 35x35, raio 4, texto 18/16;
 * atual (aria-current) = fundo primary + texto ink peso 700; demais = borda 1px border + texto foreground.
 */
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/cn';

export type PaginationLinkProps = React.ComponentProps<'a'> & {
  asChild?: boolean;
};

export function PaginationLink({ asChild = false, className, ...props }: PaginationLinkProps) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      data-slot="pagination-link"
      className={cn(
        'inline-flex size-35 shrink-0 items-center justify-center rounded-4 border border-solid border-border text-foreground text-body-large-18-regular',
        'aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-ink aria-[current=page]:text-body-large-18-bold-lh-16',
        'aria-disabled:cursor-not-allowed aria-disabled:text-disabled-text',
        className,
      )}
      {...props}
    />
  );
}
