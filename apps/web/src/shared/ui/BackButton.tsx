import { Button } from '@jg/design-system';
import { useRouter } from '@tanstack/react-router';

import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

/** Voltar do mobile: historico anterior ou, sem historico interno, a Home. */
export function BackButton({ label }: { label: string }) {
  const router = useRouter();
  const back = () => {
    if (router.history.canGoBack()) router.history.back();
    else void router.navigate({ to: '/' });
  };
  return (
    <div className="mb-16 tablet:hidden">
      <Button variant="ghost" onClick={back} className="gap-8 px-0">
        <ArrowLeftIcon />
        {label}
      </Button>
    </div>
  );
}
