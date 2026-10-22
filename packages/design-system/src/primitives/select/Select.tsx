import type { ReactNode } from 'react';

export type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
};

export function Select(props: SelectProps) {
  void props;
  return null;
}
