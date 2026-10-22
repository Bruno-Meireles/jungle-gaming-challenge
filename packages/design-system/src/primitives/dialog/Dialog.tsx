import * as DialogPrimitive from '@radix-ui/react-dialog';

export type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>;

export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root {...props} />;
}
