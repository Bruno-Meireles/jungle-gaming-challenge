import type { ReactElement, ReactNode } from 'react';

export type FormFieldProps = {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactElement;
};

export function FormField(props: FormFieldProps) {
  void props;
  return null;
}
