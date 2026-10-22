import { cn } from '../../lib/cn';

export type BreadcrumbProps = Omit<React.ComponentProps<'nav'>, 'aria-label'> & { label: string };

/** Renderiza `<nav aria-label={label}><ol>`; os filhos devem ser `BreadcrumbItem`. */
export function Breadcrumb({ label, className, children, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label={label} data-slot="breadcrumb" className={cn(className)} {...props}>
      <ol
        data-slot="breadcrumb-list"
        className="text-body-15-bold-lh-16 flex items-center gap-8 text-foreground"
      >
        {children}
      </ol>
    </nav>
  );
}
