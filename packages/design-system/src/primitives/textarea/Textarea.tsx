/*
 * Textarea do DS. Lacuna: o Figma nao tem Textarea; reutiliza as medidas do Email Input 70381:242
 * (raio 5, padding 16/12, borda 1px, texto 16/16 foreground, placeholder 14/16 secondary) com altura minima 96.
 * Borda em repouso = --color-input-border (secondary), mesma decisao de contraste do Input.
 */
import { cn } from '../../lib/cn';

export type TextareaProps = React.ComponentProps<'textarea'>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // --spacing = 1px (tokens.css): min-h-96 = 96px, px-16 = 16px, py-12 = 12px.
        'block min-h-96 w-full resize-y rounded-5 border border-input-border bg-transparent px-16 py-12',
        'text-body-large-16-regular-lh-16 text-foreground',
        'placeholder:text-body-14-regular-lh-16 placeholder:text-secondary',
        'focus:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        'aria-[invalid=true]:border-destructive',
        'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text',
        className,
      )}
      {...props}
    />
  );
}
