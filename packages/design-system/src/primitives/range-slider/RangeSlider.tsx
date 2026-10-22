/*
 * RangeSlider (Filters 70485:381; Slider 70485:360 258x21; docs/figma/file.json).
 * Thumbs: Ellipse 15x15 fill primary, stroke ink 3px (70485:361/363). Trilho: linhas de 4px primary (70485:362/364).
 * O Figma pinta trilho inteiro em primary (nao ha cor de trilho inativo): aqui o trilho usa --color-border e a faixa
 * selecionada primary (lacuna registrada). --spacing = 1px: classes em px.
 */
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../lib/cn';

export type RangeSliderProps = {
  value: [number, number];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: [number, number]) => void;
  thumbLabels: [string, string];
  /** Texto lido por leitores de tela para cada valor (aria-valuetext); sem default de idioma. */
  getValueText: (value: number) => string;
  disabled?: boolean;
  className?: string;
};

const thumb =
  'block size-15 rounded-full border-3 border-ink bg-primary disabled:cursor-not-allowed data-[disabled]:bg-disabled-text';

export function RangeSlider({
  value,
  min,
  max,
  step,
  onValueChange,
  thumbLabels,
  getValueText,
  disabled,
  className,
}: RangeSliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="range-slider"
      className={cn('relative flex h-21 w-full touch-none items-center select-none', className)}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(next) => onValueChange([next[0] ?? min, next[1] ?? max])}
    >
      <SliderPrimitive.Track
        data-slot="range-slider-track"
        className="relative h-4 w-full grow overflow-hidden rounded-full bg-border"
      >
        <SliderPrimitive.Range
          data-slot="range-slider-range"
          className="absolute h-full bg-primary data-[disabled]:bg-disabled-text"
        />
      </SliderPrimitive.Track>
      {thumbLabels.map((label, index) => (
        <SliderPrimitive.Thumb
          key={label}
          data-slot="range-slider-thumb"
          aria-label={label}
          aria-valuetext={getValueText(value[index] ?? min)}
          className={thumb}
        />
      ))}
    </SliderPrimitive.Root>
  );
}
