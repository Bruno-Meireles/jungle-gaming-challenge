import * as TabsPrimitive from '@radix-ui/react-tabs';

export type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>;

export function TabsContent(props: TabsContentProps) {
  return <TabsPrimitive.Content data-slot="tabs-content" {...props} />;
}
