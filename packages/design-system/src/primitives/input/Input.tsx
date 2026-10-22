import type { ReactNode } from 'react';

export type InputProps = React.ComponentProps<'input'> & {
  startSlot?: ReactNode;
  endSlot?: ReactNode;
};

export function Input(props: InputProps) {
  void props;
  return null;
}
