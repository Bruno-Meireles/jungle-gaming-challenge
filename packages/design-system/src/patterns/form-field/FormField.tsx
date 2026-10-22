/*
 * Padrao FormField: compoe Label + controle + hint + erro e cuida das ligacoes de acessibilidade
 * (id/htmlFor, aria-describedby, aria-invalid). O controle (ex.: Input) recebe as props via cloneElement.
 * Medidas de espacamento (gap) sem no proprio no Figma: lacuna registrada em C8-form-field.md.
 */
import { cloneElement, useId, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Label } from '../../primitives/label';

export type FormFieldProps = {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactElement<{
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
    required?: boolean;
  }>;
};

export function FormField({ label, required = false, hint, error, children }: FormFieldProps) {
  const generated = useId();
  const id = children.props.id ?? generated;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  // role="alert" apenas quando o erro muda depois da montagem (nao anuncia o estado inicial).
  const [seenError, setSeenError] = useState(error);
  const [changed, setChanged] = useState(false);
  if (seenError !== error) {
    setSeenError(error);
    setChanged(true);
  }

  const hasError = Boolean(error);
  const describedBy =
    [children.props['aria-describedby'], hint ? hintId : undefined, hasError ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  const control = cloneElement(children, {
    id,
    'aria-describedby': describedBy,
    ...(hasError ? { 'aria-invalid': true } : {}),
    ...(required ? { required: true } : {}),
  });

  return (
    <div data-slot="form-field" className="flex flex-col gap-8">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {control}
      {hint ? (
        <p id={hintId} className="text-body-14-regular-lh-16 text-secondary">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p
          id={errorId}
          role={changed ? 'alert' : undefined}
          className="text-body-14-regular-lh-16 text-text-coral"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
