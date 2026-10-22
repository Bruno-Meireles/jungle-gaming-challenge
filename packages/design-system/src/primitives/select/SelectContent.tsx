/* Painel da lista: surface-card (#241612), borda 1px --color-border, raio 5; largura minima do trigger. */
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '../../lib/cn';

export type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content>;

export function SelectContent({ className, children, position = 'popper', ...props }: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={4}
        className={cn(
          'z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-5 border border-border bg-surface-card text-foreground',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-4">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
