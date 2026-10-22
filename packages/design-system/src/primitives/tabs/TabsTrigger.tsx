/*
 * Aba (Figma 70395:241, mobile): frame de 20 de altura, texto 14/16; ativa = bold, text-accent (E89B55)
 * e linha de 2px primary (Line 3, 15:5366) centrada na borda inferior do frame (y=20); inativa = regular, foreground.
 * --spacing = 1px: classes em px. A linha e um ::after absoluto (nao altera a altura de 20).
 */
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/cn';

export type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>;

export function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'relative h-20 cursor-pointer whitespace-nowrap text-foreground text-body-14-regular-lh-16',
        'after:absolute after:inset-x-0 after:top-19 after:h-2 after:content-[""]',
        'data-[state=active]:text-text-accent data-[state=active]:text-body-14-bold-lh-16',
        'data-[state=active]:after:bg-primary',
        'disabled:cursor-not-allowed disabled:text-disabled-text',
        className,
      )}
      {...props}
    />
  );
}
