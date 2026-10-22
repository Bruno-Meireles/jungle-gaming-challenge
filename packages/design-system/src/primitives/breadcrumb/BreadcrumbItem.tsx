import { cn } from '../../lib/cn';

export type BreadcrumbItemProps = React.ComponentProps<'li'>;

/** O separador "/" e decorativo (aria-hidden) e some no ultimo item. */
export function BreadcrumbItem({ className, children, ...props }: BreadcrumbItemProps) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('group/item flex items-center gap-8', className)}
      {...props}
    >
      {children}
      <span aria-hidden="true" data-slot="breadcrumb-separator" className="group-last/item:hidden">
        /
      </span>
    </li>
  );
}
