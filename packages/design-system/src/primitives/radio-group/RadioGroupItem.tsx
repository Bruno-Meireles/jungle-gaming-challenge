/*
 * Item do RadioGroup. Medidas (carteira/rede, 11:2862; docs/figma/file.json):
 * circulo 16x16, stroke primary 1.2px (Ellipse 70522:3321;70504:3180); miolo marcado 10x10 primary (…3186).
 * Card (Frame 309 …3178): 405x45, raio 3, borda 1px --color-border, padding-x 12, gap 10;
 * selecionado (Frame 311 …3182): borda primary, padding-x 16, gap 12.
 * --spacing = 1px: classes em px (h-45, px-12, gap-10).
 */
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../lib/cn';

export type RadioGroupItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  variant?: 'default' | 'card';
};

const circle =
  'flex size-16 shrink-0 items-center justify-center rounded-full border-[1.2px] border-primary bg-transparent';

const Dot = () => (
  <RadioGroupPrimitive.Indicator data-slot="radio-indicator" className="size-10 rounded-full bg-primary" />
);

export function RadioGroupItem({ variant = 'default', className, children, ...props }: RadioGroupItemProps) {
  if (variant === 'card') {
    return (
      <RadioGroupPrimitive.Item
        data-slot="radio-group-item"
        className={cn(
          'flex h-45 w-full items-center gap-10 rounded-3 border border-border px-12 text-left text-foreground',
          'text-body-14-regular-lh-16',
          'data-[state=checked]:gap-12 data-[state=checked]:border-primary data-[state=checked]:px-16',
          'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text',
          className,
        )}
        {...props}
      >
        <span data-slot="radio-circle" className={circle}>
          <Dot />
        </span>
        {children}
      </RadioGroupPrimitive.Item>
    );
  }
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(circle, 'disabled:cursor-not-allowed disabled:border-disabled-text', className)}
      {...props}
    >
      <Dot />
    </RadioGroupPrimitive.Item>
  );
}
