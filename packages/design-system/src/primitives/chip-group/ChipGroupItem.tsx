/*
 * Chip da selecao unica. Figma so desenha o texto ("Edicoes" 11:2024); medida derivada de Button/Input (Lacuna):
 * h-40, raio 3, padding-x 16, borda 1px secondary, 14/16. Selecionado: fundo primary, texto ink, bold (nao so cor).
 * --spacing = 1px (tokens.css).
 */
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../lib/cn';

export type ChipGroupItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item>;

export function ChipGroupItem({ className, ...props }: ChipGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="chip-group-item"
      className={cn(
        'inline-flex h-40 shrink-0 items-center justify-center rounded-3 border border-secondary bg-transparent px-16 text-body-14-regular-lh-16 text-foreground',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-ink data-[state=checked]:text-body-14-bold-lh-16',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
