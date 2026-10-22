/*
 * Sheet (C24): folha ancorada a uma borda, derivada do botao de filtro mobile (Figma 15:5313; sem frame proprio).
 * Compoe o Dialog (C23): foco, trap, Esc, devolucao de foco e aria-modal vem de la.
 * Desvios: medidas (padding 24, raio 8 nos cantos livres, largura 320 laterais, altura max 85% embaixo) e a animacao
 * (slide 200ms, ease-out) sao derivadas, sem valor no Figma. A animacao e desligada sob prefers-reduced-motion
 * (base.css, seletor [data-slot='sheet-content']).
 */
import { cn } from '../../lib/cn';
import { Dialog, DialogContent } from '../dialog';
import type { DialogContentProps } from '../dialog';

export type SheetSide = 'bottom' | 'left' | 'right';

export type SheetProps = {
  side: SheetSide;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  className?: string;
  contentProps?: Omit<DialogContentProps, 'className' | 'children'>;
};

const SIDE_CLASS: Record<SheetSide, string> = {
  bottom:
    'top-auto right-0 bottom-0 left-0 w-full max-w-none max-h-[85%] translate-x-0 translate-y-0 rounded-t-8 rounded-b-none data-[state=open]:animate-sheet-in-bottom data-[state=closed]:animate-sheet-out-bottom',
  left: 'top-0 right-auto bottom-0 left-0 h-full max-h-none w-320 max-w-[calc(100%-56px)] translate-x-0 translate-y-0 rounded-none data-[state=open]:animate-sheet-in-left data-[state=closed]:animate-sheet-out-left',
  right:
    'top-0 right-0 bottom-0 left-auto h-full max-h-none w-320 max-w-[calc(100%-56px)] translate-x-0 translate-y-0 rounded-none data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right',
};

export function Sheet({ side, open, defaultOpen, onOpenChange, children, className, contentProps }: SheetProps) {
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="sheet-content"
        data-side={side}
        className={cn('p-24', SIDE_CLASS[side], className)}
        {...contentProps}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
