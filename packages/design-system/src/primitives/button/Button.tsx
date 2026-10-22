/*
 * Origem: shadcn/ui Button (copia manual sobre @radix-ui/react-slot + cva, ADR-05), 2026-10-22.
 * Classes reescritas com os tokens do projeto (docs/design-tokens.md).
 */
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const buttonVariants = cva('cursor-pointer', {
  variants: {
    variant: {
      primary: 'bg-primary hover:bg-primary-hover',
      outline: '',
      ghost: '',
      icon: '',
    },
    size: {
      md: '',
      lg: '',
      block: '',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'icon';
  size?: 'md' | 'lg' | 'block';
  asChild?: boolean;
  loading?: boolean;
};

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
