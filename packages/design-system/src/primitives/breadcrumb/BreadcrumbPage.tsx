import { cn } from '../../lib/cn';

export type BreadcrumbPageProps = React.ComponentProps<'span'>;

export function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <span data-slot="breadcrumb-page" aria-current="page" className={cn(className)} {...props} />
  );
}
