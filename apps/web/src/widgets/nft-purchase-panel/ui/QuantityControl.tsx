export type QuantityControlProps = {
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  label: string;
  decrementLabel: string;
  incrementLabel: string;
};

const stepButton = [
  'inline-flex h-49.5 w-33 shrink-0 cursor-pointer items-center justify-center rounded-33 border border-solid border-ink bg-primary p-0 text-ink',
  'not-disabled:hover:bg-primary-hover not-disabled:active:bg-primary-active',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
  'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text',
].join(' ');

/*
 * Mesma aparencia do QuantityStepper do DS, mas com o valor num <input type="number" readOnly> (spinbutton):
 * o stepper do DS expoe o valor em <output> (role status) e nao oferece o papel/valor exigidos pelo teste do painel.
 */
export function QuantityControl({
  value,
  min,
  max,
  onValueChange,
  label,
  decrementLabel,
  incrementLabel,
}: QuantityControlProps) {
  return (
    <div className="flex items-center gap-12">
      <button
        type="button"
        aria-label={decrementLabel}
        className={stepButton}
        disabled={value <= min}
        onClick={() => onValueChange(value - 1)}
      >
        <svg aria-hidden="true" width="15.4" height="2.2" viewBox="0 0 15.4 2.2" fill="currentColor">
          <rect width="15.4" height="2.2" />
        </svg>
      </button>
      <input
        type="number"
        readOnly
        aria-label={label}
        min={min}
        max={max}
        value={value}
        className="w-40 appearance-none border-0 bg-transparent p-0 text-center text-title-20-regular-lh-10 text-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={incrementLabel}
        className={stepButton}
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
