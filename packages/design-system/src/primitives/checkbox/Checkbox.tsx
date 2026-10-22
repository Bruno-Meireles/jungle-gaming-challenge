/*
 * Checkbox do DS sobre @radix-ui/react-checkbox. Medidas: Ellipse 22 (9:1867, docs/figma/file.json:273758-273905):
 * 16x16, stroke 1.5 primary, sem fill. Desvios: forma quadrada raio 3 e marcado = fundo primary + check ink (forma, nao so cor).
 * --spacing = 1px (tokens.css): size-16 = 16px.
 */
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '../../lib/cn';

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'flex size-16 shrink-0 items-center justify-center rounded-3 border-[1.5px] border-primary bg-transparent p-0',
        'data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-ink">
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m2.5 6.5 2.5 2.5 4.5-5.5" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
