/*
 * Input de senha com botao Mostrar/Ocultar. Medidas herdadas do Input (Password Input 70381:243,
 * docs/figma/file.json:193116-193128). Icone Iconly Hide (9:964 oculto / 9:1592 visivel), 20x20 (lacuna: tamanho nao
 * verificado no JSON). O botao e um <button type="button"> com aria-pressed; o foco permanece nele ao alternar.
 */
import { useState } from 'react';
import { Input } from '../input';

export type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  showLabel: string;
  hideLabel: string;
};

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" />
      <circle cx="10" cy="10" r="2.5" />
      {crossed ? null : <path d="M3 17 17 3" />}
    </svg>
  );
}

export function PasswordInput({ showLabel, hideLabel, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      endSlot={
        <button
          type="button"
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="flex size-20 items-center justify-center rounded-5 text-secondary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <span className="sr-only">{visible ? hideLabel : showLabel}</span>
          <EyeIcon crossed={visible} />
        </button>
      }
    />
  );
}
