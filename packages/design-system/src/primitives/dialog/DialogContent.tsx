/*
 * Painel do modal (Figma Sign In/Sign Up Modal 70381:239 / 70383:239): 500 de largura, surface-card, raio 8.
 * Desvios registrados: o Figma nao define overlay (usa rgba(10,6,4,.45), a cor-base das sombras do DS) nem sombra
 * no modal (usa --shadow-x0-y0-b40-a45-0a0604). Em telas estreitas o painel encolhe para caber (margem de 16).
 * Radix cuida de role=dialog, aria-labelledby/describedby, trap de foco, Esc e devolucao de foco; aria-modal e nosso.
 */
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useState } from 'react';
import { cn } from '../../lib/cn';

export type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content>;

export function DialogContent(props: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPanel {...props} />
    </DialogPrimitive.Portal>
  );
}

// Montado so quando aberto (o Portal do Radix usa Presence): o useState captura o foco da abertura.
function DialogPanel({ className, children, onCloseAutoFocus, ...props }: DialogContentProps) {
  // O Radix so devolve o foco quando ha Dialog.Trigger; o Dialog do DS e controlado (sem trigger),
  // entao guardamos o elemento focado na abertura e o refocamos ao fechar.
  const [opener] = useState(() => (typeof document === 'undefined' ? null : document.activeElement));
  return (
    <>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 bg-[rgba(10,6,4,0.45)]"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        aria-modal="true"
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
        }}
        className={cn(
          'fixed top-1/2 left-1/2 w-500 max-w-[calc(100%-32px)] max-h-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2',
          'overflow-y-auto rounded-8 bg-surface-card p-48 text-foreground shadow-x0-y0-b40-a45-0a0604',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </>
  );
}
