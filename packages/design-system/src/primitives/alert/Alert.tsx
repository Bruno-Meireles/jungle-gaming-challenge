/*
 * Derivado (Q10/Q18): o Figma nao tem alerta. Tokens existentes: contorno/icone em error|success|primary
 * (nao-texto, >=3:1 sobre surface-card), texto em foreground. O tom nao depende so da cor: icone de forma
 * propria por tom (aria-hidden) + rotulo textual para leitor de tela (VisuallyHidden).
 * error -> role=alert (assertivo); info/success -> role=status (polido).
 */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { VisuallyHidden } from '../visually-hidden';

export type AlertProps = {
  tone: 'info' | 'error' | 'success';
  toneLabel: string;
  title?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
};

const TONES = {
  error: { role: 'alert', border: 'border-error', icon: 'text-error' },
  info: { role: 'status', border: 'border-primary', icon: 'text-primary' },
  success: { role: 'status', border: 'border-success', icon: 'text-success' },
} as const;

function ToneIcon({ tone }: { tone: AlertProps['tone'] }) {
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
      className="shrink-0"
    >
      {tone === 'error' && (
        <>
          <path d="M10 2.5 18 16.5H2z" />
          <path d="M10 8v4M10 14.2v.1" />
        </>
      )}
      {tone === 'info' && (
        <>
          <circle cx="10" cy="10" r="7.5" />
          <path d="M10 9v5M10 6.2v.1" />
        </>
      )}
      {tone === 'success' && (
        <>
          <circle cx="10" cy="10" r="7.5" />
          <path d="m6.5 10.2 2.4 2.4 4.6-4.8" />
        </>
      )}
    </svg>
  );
}

export function Alert({ tone, toneLabel, title, children, action }: AlertProps) {
  const t = TONES[tone];
  return (
    <div
      role={t.role}
      className={cn(
        'flex items-start gap-12 rounded-8 border border-solid bg-surface-card p-12 text-foreground',
        t.border,
      )}
    >
      <span className={t.icon}>
        <ToneIcon tone={tone} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <VisuallyHidden>{toneLabel}</VisuallyHidden>
        {title ? <p className="text-body-14-bold-lh-auto">{title}</p> : null}
        <div className="text-body-14-regular-lh-24">{children}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
