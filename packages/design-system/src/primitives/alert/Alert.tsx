import type { ReactNode } from 'react';

export type AlertProps = {
  tone: 'info' | 'error' | 'success';
  title?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
};

export function Alert(props: AlertProps) {
  void props;
  return null;
}
