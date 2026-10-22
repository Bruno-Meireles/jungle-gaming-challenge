/*
 * ChipGroup: selecao unica sobre @radix-ui/react-radio-group (radiogroup, roving tabindex, setas).
 * Orientacao horizontal; os chips quebram de linha quando faltar espaco.
 */
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../lib/cn';

export type ChipGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root>;

export function ChipGroup({ className, ...props }: ChipGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="chip-group"
      orientation="horizontal"
      className={cn('flex flex-wrap gap-8', className)}
      {...props}
    />
  );
}
