import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/cn';

export type DialogTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-foreground text-title-20-medium', className)}
      {...props}
    />
  );
}
