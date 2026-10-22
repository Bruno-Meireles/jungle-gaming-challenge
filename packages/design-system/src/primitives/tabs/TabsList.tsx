/* Lista de abas: linha com gap 16 entre abas (Frame 234, 70367:2847: 143 + 16 + 59 = 218). */
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/cn';

export type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>;

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('flex items-start gap-16', className)}
      {...props}
    />
  );
}
