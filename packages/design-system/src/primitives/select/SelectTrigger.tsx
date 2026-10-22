/*
 * Trigger do Select. Medidas: campo de 40 de altura, raio 5, borda 1px (desvio do DS: --color-input-border,
 * igual ao Input), padding-x 16; chevron "Arrow-Down" 9:1589 = 20x20 (docs/figma/file.json:241387).
 * --spacing = 1px: classes em px.
 */
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '../../lib/cn';

export type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger>;

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'flex h-40 w-full cursor-pointer items-center justify-between gap-8 rounded-5 border border-input-border bg-transparent px-16',
        'text-left text-body-large-16-regular-lh-16 text-foreground',
        'data-[placeholder]:text-body-14-regular-lh-16 data-[placeholder]:text-secondary',
        'focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        'aria-[invalid=true]:border-destructive',
        'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className="flex size-20 shrink-0 items-center justify-center text-foreground"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M3.5 6.5 10 13l6.5-6.5" />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
