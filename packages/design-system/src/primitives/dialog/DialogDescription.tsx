import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/cn';

export type DialogDescriptionProps = React.ComponentProps<typeof DialogPrimitive.Description>;

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-foreground text-caption-13-regular-lh-16', className)}
      {...props}
    />
  );
}
