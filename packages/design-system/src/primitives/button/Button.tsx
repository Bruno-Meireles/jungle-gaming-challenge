/*
 * Origem: shadcn/ui Button (copia manual sobre @radix-ui/react-slot + cva, ADR-05), 2026-10-22.
 * Classes reescritas com os tokens do projeto (docs/design-tokens.md). Medidas: ver Button.test.tsx
 * (nos do Figma: Save Button 70386:262, Frame 162 70342:2757 "Favoritar", 11:2842 "Continuar explorando",
 * Search/Cart Icon 70486:519/521, Frame 324 I70522:3321;70504:3188, Button 70370:249).
 */
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-ink not-disabled:hover:bg-primary-hover not-disabled:active:bg-primary-active disabled:bg-disabled-bg disabled:text-disabled-text',
        outline:
          'h-40 gap-8 rounded-6 border border-solid border-primary px-13 text-text-accent text-body-14-medium-lh-20 disabled:border-disabled-text disabled:text-disabled-text',
        ghost: 'text-text-accent text-body-15-regular-lh-16 disabled:text-disabled-text',
        icon: 'size-24 text-foreground disabled:text-disabled-text',
      },
      size: {
        md: '',
        lg: '',
        block: '',
      },
    },
    compoundVariants: [
      { variant: 'primary', size: 'md', class: 'h-40 rounded-3 px-40 text-body-14-bold-lh-16' },
      { variant: 'primary', size: 'lg', class: 'h-45 rounded-8 px-16 text-body-15-bold-lh-16' },
      { variant: 'primary', size: 'block', class: 'h-40 w-full rounded-3 text-body-15-bold-lh-16' },
    ],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type CommonProps = React.ComponentProps<'button'> & {
  size?: 'md' | 'lg' | 'block';
  asChild?: boolean;
  loading?: boolean;
};

/** variant="icon" nao tem texto visivel: o nome acessivel (aria-label) e obrigatorio. */
export type ButtonProps = CommonProps &
  (
    | { variant?: 'primary' | 'outline' | 'ghost' }
    | { variant: 'icon'; 'aria-label': string }
  );

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : type}
      disabled={disabled || loading}
      aria-busy={loading ? true : undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
