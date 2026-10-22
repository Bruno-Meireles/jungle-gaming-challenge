/*
 * Tabs do DS sobre @radix-ui/react-tabs (roving tabindex, setas, Home/End e ids vem do Radix).
 * Medidas: variante mobile do Figma (Tabs 70395:241, docs/figma/file.json).
 */
import * as TabsPrimitive from '@radix-ui/react-tabs';

export type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>;

export function Tabs(props: TabsProps) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}
