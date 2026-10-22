import * as SelectPrimitive from '@radix-ui/react-select';

export type SelectProps = React.ComponentProps<typeof SelectPrimitive.Root>;

export function Select(props: SelectProps) {
  return <SelectPrimitive.Root {...props} />;
}
