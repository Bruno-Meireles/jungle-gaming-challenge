/*
 * Origem: shadcn/ui Avatar (copia manual, ADR-05), 2026-10-22, sobre @radix-ui/react-avatar.
 * Medidas do "Avatar Field" (Perfil do Colecionador 9:1238): 50x50, raio 25 (--radius-25), fill --color-surface-raised,
 * borda 1px --color-border (file.json:243564-243606). Fallback: icone (9:1550) em --color-primary via currentColor.
 */
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type AvatarProps = Omit<ComponentProps<typeof AvatarPrimitive.Root>, 'children'> & {
  src?: string;
  alt: string;
  fallback: ReactNode;
};

export function Avatar({ src, alt, fallback, className, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'inline-flex size-[50px] shrink-0 items-center justify-center overflow-hidden rounded-25 border border-border bg-surface-raised text-primary',
        className,
      )}
      {...props}
    >
      {src ? <AvatarPrimitive.Image src={src} alt={alt} className="size-full object-cover" /> : null}
      <AvatarPrimitive.Fallback className="inline-flex size-full items-center justify-center">
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
