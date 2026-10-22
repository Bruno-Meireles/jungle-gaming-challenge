/*
 * Origem: shadcn/ui Separator (copia manual sobre @radix-ui/react-separator, ADR-05), 2026-10-21.
 * Classes reescritas com os tokens do projeto. Espessura 0.3px = strokeWeight do nó
 * "Line 1" do Header With Divider (Figma 70504:3017); cor = --color-primary (#D28A4C).
 */
import * as SeparatorPrimitive from '@radix-ui/react-separator';

export type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root>;

export function Separator({
  className,
  orientation = 'horizontal',
  decorative = false,
  ...props
}: SeparatorProps) {
  const size = orientation === 'vertical' ? 'h-full w-[0.3px]' : 'h-[0.3px] w-full';
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={['bg-primary shrink-0', size, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
