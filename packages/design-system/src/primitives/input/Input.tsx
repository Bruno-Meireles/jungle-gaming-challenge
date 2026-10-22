/*
 * Input de texto do DS. Medidas: Email Input 70381:242 (docs/figma/file.json:192892-193115):
 * 340x40 (FILL), raio 5, padding 16/12, borda 1px, placeholder secondary 14/16 regular (estilo 70321:351).
 * Foco 70381:243 (193116-193128): borda primary. Texto digitado: 16/16 regular foreground (70321:332).
 * Desvio (decisao do usuario, contraste): borda em repouso = --color-input-border (secondary), nao --color-border.
 * Estrutura: o wrapper [data-slot="input"] carrega a caixa visual, para acomodar startSlot/endSlot.
 */
import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type InputProps = React.ComponentProps<'input'> & {
  startSlot?: ReactNode;
  endSlot?: ReactNode;
};

const box = cva(
  [
    'flex h-10 w-full items-center gap-2 rounded-5 border border-input-border px-4 py-3',
    'has-[input:focus]:border-primary has-[input:focus-visible]:outline-2',
    'has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus',
    'has-[input[aria-invalid=true]]:border-destructive',
    'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-disabled-bg',
  ],
  { variants: {}, defaultVariants: {} },
);

export function Input({ className, startSlot, endSlot, ...props }: InputProps) {
  return (
    <div data-slot="input" className={cn(box(), className)}>
      {startSlot ? (
        <span aria-hidden="true" className="flex shrink-0 items-center text-secondary">
          {startSlot}
        </span>
      ) : null}
      <input
        data-slot="input-control"
        className={cn(
          'min-w-0 flex-1 bg-transparent text-body-large-16-regular-lh-16 text-foreground outline-none',
          'placeholder:text-body-14-regular-lh-16 placeholder:text-secondary',
          'disabled:cursor-not-allowed disabled:text-disabled-text',
        )}
        {...props}
      />
      {endSlot ? <span className="flex shrink-0 items-center">{endSlot}</span> : null}
    </div>
  );
}
