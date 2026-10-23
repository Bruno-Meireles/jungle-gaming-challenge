import type { ReactNode } from 'react';

import { PageContainer } from '../../../shared/ui';

/** Moldura da tela: titulo + coluna de itens + coluna lateral (resumo, cupom, CTA). */
export function CartPageView({ heading, main, aside }: { heading: string; main: ReactNode; aside?: ReactNode }) {
  return (
    <PageContainer className="py-24 tablet:py-32">
      <h1 className="mb-24 text-heading-28-bold text-foreground">{heading}</h1>
      <div className="flex flex-col gap-32 desktop:grid desktop:grid-cols-[1fr_405px] desktop:gap-48">
        <div>{main}</div>
        {aside ? <aside className="flex flex-col gap-24">{aside}</aside> : null}
      </div>
    </PageContainer>
  );
}
