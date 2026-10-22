/*
 * RadioGroup do DS sobre @radix-ui/react-radio-group (roving tabindex e setas vem do Radix).
 * Layout vertical com gap 16 (Frame 312, 70522:3321;70504:3172, docs/figma/file.json).
 */
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../lib/cn';

export type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root>;

export function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('flex flex-col gap-16', className)}
      {...props}
    />
  );
}
