/*
 * Origem: shadcn/ui Label (copia manual sobre @radix-ui/react-label, ADR-05), 2026-10-22.
 * Classes reescritas com tokens: rotulo "Nome de exibicao" = text-body-15-regular-lh-15 + foreground
 * (Figma 70321:341 / 70323:306); asterisco = text-title-22-regular + text-coral (70321:311 / 70323:305).
 */
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../../lib/cn';

export type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean };

export function Label({ className, required = false, children, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('inline-flex items-center text-body-15-regular-lh-15 text-foreground', className)}
      {...props}
    >
      {children}
      {required ? (
        <span
          data-slot="label-required"
          aria-hidden="true"
          className="text-title-22-regular text-text-coral"
        >
          *
        </span>
      ) : null}
    </LabelPrimitive.Root>
  );
}
