import type { ComponentProps } from 'react';

export type VisuallyHiddenProps = ComponentProps<'span'>;

export function VisuallyHidden({ className, children, ...rest }: VisuallyHiddenProps) {
  return (
    <span {...rest} className={className ? `sr-only ${className}` : 'sr-only'}>
      {children}
    </span>
  );
}
