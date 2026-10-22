import type { ComponentProps } from 'react';

export function VisuallyHidden({ className, children, ...rest }: ComponentProps<'span'>) {
  return (
    <span {...rest} className={className ? `sr-only ${className}` : 'sr-only'}>
      {children}
    </span>
  );
}
