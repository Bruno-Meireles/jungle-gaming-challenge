/*
 * Sem frame no Figma (desvio ADR-12): fundo derivado de --color-surface-card -> --color-surface-raised.
 * Gradiente de 200% de largura deslizando via --animate-shimmer (tokens.css).
 */
import { cn } from '../../lib/cn';

export type SkeletonProps = React.ComponentProps<'div'>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        'animate-shimmer bg-linear-to-r from-surface-card via-surface-raised to-surface-card bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  );
}
