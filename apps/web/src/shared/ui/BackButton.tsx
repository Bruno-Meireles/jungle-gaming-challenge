import { useRouter } from '@tanstack/react-router';

import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

/* Voltar do mobile (Figma "Back" 35x35: circulo #2F1D15 com borda #3F2319): historico anterior ou, sem historico interno, a Home. */
export function BackButton({ label }: { label: string }) {
  const router = useRouter();
  const back = () => {
    if (router.history.canGoBack()) router.history.back();
    else void router.navigate({ to: '/' });
  };
  return (
    <div className="mb-16 tablet:hidden">
      <button
        type="button"
        onClick={back}
        className="flex size-35 cursor-pointer items-center justify-center rounded-full border border-solid border-border bg-surface-raised p-0 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <ArrowLeftIcon />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}
