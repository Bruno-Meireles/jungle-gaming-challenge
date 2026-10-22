/*
 * Origem: shadcn/ui Badge (copia manual, ADR-05), 2026-10-22. Reescrito com cva + tokens do projeto.
 *  - count ("Badge Count", I70522:3240): circulo 16x16 (file.json:2368-2369), fill --color-primary (2316-2318),
 *    texto --color-ink Roboto Mono 500/10 (2436-2438, 2503-2505) = --text-tiny-10-medium.
 *    Contorno externo de 2px na cor ink (file.json:2353-2354): implementado como `ring-2 ring-ink`
 *    (box-shadow, nao ocupa layout). Derivado: o Figma usa stroke OUTSIDE; ring-2 e o equivalente.
 *    line-height 13.19px explicito (lineHeightPx, file.json:2509-2511): o token tem line-height normal, que computa
 *    sem valor numerico; o teste de medida exige px.
 *    Raio 8 (--radius-8) = metade de 16 (circulo; derivado, ellipse sem cornerRadius).
 *  - label ("RARO", 15:5418/15:5419): altura 32 (file.json:281935-281936), padding 8/7 (282036, 282042),
 *    fill primary, texto ink Roboto Mono 500/13/16 = --text-caption-13-medium. Canto reto do Figma nao
 *    replicado (Q20); raio nominal ausente no Figma = Lacuna, sem raio.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const badgeVariants = cva('inline-flex shrink-0 items-center bg-primary text-ink', {
  variants: {
    variant: {
      count: 'size-[16px] justify-center rounded-8 text-tiny-10-medium leading-[13.19px] ring-2 ring-ink',
      label: 'h-[32px] px-[8px] pt-[7px] text-caption-13-medium',
    },
  },
});

export type BadgeProps = React.ComponentProps<'span'> &
  Required<Pick<VariantProps<typeof badgeVariants>, 'variant'>>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  // aria-label em <span> sem role e ignorado por leitores de tela: com rotulo, o badge e uma imagem nomeada.
  const role = props['aria-label'] && !props.role ? 'img' : props.role;
  return <span data-slot="badge" role={role} className={cn(badgeVariants({ variant }), className)} {...props} />;
}
