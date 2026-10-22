import { cn } from '../../lib/cn';

export type BreadcrumbItemProps = React.ComponentProps<'li'>;

/** O separador "/" e decorativo (aria-hidden) e some no ultimo item. */
export function BreadcrumbItem({ className, children, ...props }: BreadcrumbItemProps) {
  return (
    <li data-slot="breadcrumb-item" className={cn(className)} {...props}>
      {children}
      <span aria-hidden="true" data-slot="breadcrumb-separator">
        /
      </span>
    </li>
  );
}
