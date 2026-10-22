/*
 * QuantityStepper do DS. Medidas: grupo "01" 70342:2762 / Frame 48 70410:4189 (docs/figma/file.json:51135): gap 12,
 * "Add Button" 70410:4190/4194 33x49.5, raio 33, fill primary, stroke 1 ink; glifos 15.4; valor 20/28 regular foreground.
 * Desvios (sem desenho no Figma): hover primary-hover, foco outline 2px focus, disabled com tokens disabled-*.
 * --spacing = 1px (tokens.css): w-33 = 33px.
 */
import { cn } from '../../lib/cn';

export type QuantityStepperProps = {
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  label: string;
  decrementLabel?: string;
  incrementLabel?: string;
};

const buttonClass = cn(
  'inline-flex h-49.5 w-33 shrink-0 cursor-pointer items-center justify-center rounded-33 border border-solid border-ink bg-primary p-0 text-ink',
  'not-disabled:hover:bg-primary-hover not-disabled:active:bg-primary-active',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
  'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text',
);

export function QuantityStepper({
  value,
  min,
  max,
  onValueChange,
  label,
  decrementLabel = 'Diminuir',
  incrementLabel = 'Aumentar',
}: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="quantity-stepper"
      className="flex items-center gap-12"
    >
      <button
        type="button"
        aria-label={decrementLabel}
        className={buttonClass}
        disabled={value <= min}
        onClick={() => onValueChange(value - 1)}
      >
        <svg aria-hidden="true" width="15.4" height="2.2" viewBox="0 0 15.4 2.2" fill="currentColor">
          <rect width="15.4" height="2.2" />
        </svg>
      </button>
      <output
        aria-live="polite"
        className="text-center text-title-20-regular-lh-10 text-foreground"
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={incrementLabel}
        className={buttonClass}
        disabled={value >= max}
        onClick={() => onValueChange(value + 1)}
      >
        <svg aria-hidden="true" width="15.4" height="15.4" viewBox="0 0 15.4 15.4" fill="currentColor">
          <rect y="6.6" width="15.4" height="2.2" />
          <rect x="6.6" width="2.2" height="15.4" />
        </svg>
      </button>
    </div>
  );
}
