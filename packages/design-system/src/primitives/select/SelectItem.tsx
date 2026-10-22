/* Opcao da lista: padding-x 16, texto 14/16; destacada = surface-raised; selecionada = text-accent bold. */
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '../../lib/cn';

export type SelectItemProps = React.ComponentProps<typeof SelectPrimitive.Item>;

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'flex h-36 cursor-pointer items-center rounded-3 px-16 text-body-14-regular-lh-16 text-foreground outline-none',
        'data-[highlighted]:bg-surface-raised',
        'data-[state=checked]:text-text-accent data-[state=checked]:text-body-14-bold-lh-16',
        'data-[disabled]:cursor-not-allowed data-[disabled]:text-disabled-text',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
