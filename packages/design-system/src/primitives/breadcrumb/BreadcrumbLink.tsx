import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/cn';

export type BreadcrumbLinkProps = React.ComponentProps<'a'> & {
  asChild?: boolean;
};

export function BreadcrumbLink({ className, asChild = false, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot : 'a';
  return <Comp data-slot="breadcrumb-link" className={cn(className)} {...props} />;
}
