/*
 * QuantityStepper do DS. Medidas md: grupo "01" 70342:2762 / Frame 48 70410:4189 (docs/figma/file.json:51135): gap 12,
 * "Add Button" 70410:4190/4194 33x49.5, raio 33, fill primary, stroke 1 ink; glifos 15.4; valor 20/28 regular foreground.
 * Medidas sm (carrinho): Frame 47 11:2028 (file.json:78068): 75x30, gap 12, botoes 20x30, raio 20.
 * Valor num <input inputMode="numeric">: digitar nao confirma; Enter/blur confirmam (clamp a [min,max]); invalido reverte;
 * ArrowUp/ArrowDown ajustam em 1.
 * Desvios (sem desenho no Figma): hover primary-hover, foco outline 2px focus, disabled com tokens disabled-*.
 * --spacing = 1px (tokens.css): w-33 = 33px.
 */
import { useState } from 'react';
import { cn } from '../../lib/cn';

export type QuantityStepperProps = {
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  label: string;
  decrementLabel: string;
  incrementLabel: string;
  size?: 'md' | 'sm';
};

const SIZES = {
  md: { button: 'h-49.5 w-33 rounded-33', input: 'w-40 text-title-20-regular-lh-10' },
  sm: { button: 'h-30 w-20 rounded-20', input: 'w-20 text-body-14-regular-lh-24' },
} as const;

const buttonBase = cn(
  'inline-flex shrink-0 cursor-pointer items-center justify-center border border-solid border-ink bg-primary p-0 text-ink',
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
  decrementLabel,
  incrementLabel,
  size = 'md',
}: QuantityStepperProps) {
  const s = SIZES[size];
  const [draft, setDraft] = useState<string | null>(null);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const change = (n: number) => {
    const next = clamp(n);
    if (next !== value) onValueChange(next);
  };
  const commit = () => {
    if (draft === null) return;
    const text = draft.trim();
    setDraft(null);
    if (/^\d+$/.test(text)) change(parseInt(text, 10));
  };

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
        className={cn(buttonBase, s.button)}
        disabled={value <= min}
        onClick={() => change(value - 1)}
      >
        <svg aria-hidden="true" width="15.4" height="2.2" viewBox="0 0 15.4 2.2" fill="currentColor">
          <rect width="15.4" height="2.2" />
        </svg>
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            setDraft(null);
            change(value + (e.key === 'ArrowUp' ? 1 : -1));
          }
        }}
        className={cn(
          'min-w-0 border-0 bg-transparent p-0 text-center text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
          s.input,
        )}
      />
      <button
        type="button"
        aria-label={incrementLabel}
        className={cn(buttonBase, s.button)}
        disabled={value >= max}
        onClick={() => change(value + 1)}
      >
        <svg aria-hidden="true" width="15.4" height="15.4" viewBox="0 0 15.4 15.4" fill="currentColor">
          <rect y="6.6" width="15.4" height="2.2" />
          <rect x="6.6" width="2.2" height="15.4" />
        </svg>
      </button>
    </div>
  );
}
