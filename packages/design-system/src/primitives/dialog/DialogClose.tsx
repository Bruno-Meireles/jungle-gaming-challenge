/*
 * Botao X (Figma 9:947): 18x18, tracos primary; a 12 da borda direita e 11 do topo do painel (Sign In Modal).
 */
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/cn';

export type DialogCloseProps = Omit<React.ComponentProps<typeof DialogPrimitive.Close>, 'children'> & {
  closeLabel?: string;
};

export function DialogClose({ closeLabel = 'Fechar', className, ...props }: DialogCloseProps) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      aria-label={closeLabel}
      className={cn(
        'absolute top-11 right-12 flex size-18 cursor-pointer items-center justify-center text-primary',
        className,
      )}
      {...props}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
        <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="2" />
      </svg>
    </DialogPrimitive.Close>
  );
}
