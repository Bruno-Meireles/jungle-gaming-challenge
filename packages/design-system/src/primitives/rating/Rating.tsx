/*
 * Medidas do Figma (card 10:244, "Frame 40" 11:1210): 5x "Iconly/Bold/Star" (componente 11:1192) em instancias 15x15,
 * espaco 4. Vetor 12.5x11.88 (fillGeometry de I11:1195;11:1194) centrado na instancia (offset 1.25/1.5625).
 * Cheia = --color-primary; vazia = --color-text-secondary (5a estrela, 11:1207).
 */
import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';

export type RatingProps = Omit<ComponentProps<'div'>, 'children'> & {
  value: number;
  max: 5;
  label: string;
};

const STAR_PATH =
  'M9.9493 7.3875C9.78742 7.54437 9.71305 7.77125 9.74992 7.99375L10.3055 11.0687C10.3524 11.3294 10.2424 11.5931 10.0243 11.7438C9.81055 11.9 9.52617 11.9188 9.29305 11.7938L6.52492 10.35C6.42867 10.2987 6.3218 10.2713 6.21242 10.2681L6.04305 10.2681C5.9843 10.2769 5.9268 10.2956 5.8743 10.3244L3.10555 11.775C2.96867 11.8438 2.81367 11.8681 2.6618 11.8438C2.2918 11.7738 2.04492 11.4213 2.10555 11.0494L2.6618 7.97437C2.69867 7.75 2.6243 7.52187 2.46242 7.3625L0.205547 5.175C0.0167974 4.99187 -0.0488276 4.71688 0.0374224 4.46875C0.121172 4.22125 0.334922 4.04063 0.593047 4L3.6993 3.54938C3.93555 3.525 4.14305 3.38125 4.2493 3.16875L5.61805 0.3625C5.65055 0.3 5.69242 0.2425 5.74305 0.19375L5.7993 0.15C5.82867 0.1175 5.86242 0.090625 5.89992 0.06875L5.96805 0.04375L6.0743 0L6.33742 0C6.57242 0.024375 6.7793 0.165 6.88742 0.375L8.2743 3.16875C8.3743 3.37313 8.56867 3.515 8.79305 3.54938L11.8993 4C12.1618 4.0375 12.3812 4.21875 12.468 4.46875C12.5499 4.71938 12.4793 4.99437 12.2868 5.175L9.9493 7.3875Z';

export function Rating({ value, max, label, className, ...props }: RatingProps) {
  const filled = Math.min(max, Math.max(0, Math.round(value)));
  return (
    <div
      data-slot="rating"
      role="img"
      aria-label={label}
      className={cn('inline-flex items-center gap-[4px]', className)}
      {...props}
    >
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          width="15"
          height="15"
          viewBox="-1.25 -1.5625 15 15"
          aria-hidden="true"
          focusable="false"
          className={cn('shrink-0', i < filled ? 'text-primary' : 'text-text-secondary')}
        >
          <path d={STAR_PATH} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
