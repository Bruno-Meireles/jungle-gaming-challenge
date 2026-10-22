import type { ReactNode } from 'react';

export type SheetProps = {
  side: 'bottom' | 'left' | 'right';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

export function Sheet(props: SheetProps) {
  void props;
  return null;
}
