import { cn } from '../../lib/cn';

export type BreadcrumbProps = React.ComponentProps<'nav'>;

/** Renderiza `<nav aria-label="Trilha"><ol>`; os filhos devem ser `BreadcrumbItem`. */
export function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Trilha" data-slot="breadcrumb" className={cn(className)} {...props}>
      <ol
        data-slot="breadcrumb-list"
        className="text-body-15-bold-lh-16 flex items-center gap-8 text-foreground"
      >
        {children}
      </ol>
    </nav>
  );
}
