import type { ReactNode } from 'react';

export type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

export function Dialog(props: DialogProps) {
  void props;
  return null;
}
