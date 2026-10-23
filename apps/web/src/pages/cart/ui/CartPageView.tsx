import type { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { BackButton, PageBreadcrumb, PageContainer } from '../../../shared/ui';

/** Moldura da tela: titulo + coluna de itens + coluna lateral (resumo, cupom, CTA). */
export function CartPageView({ heading, main, aside, footer }: { heading: string; main: ReactNode; aside?: ReactNode; footer?: ReactNode }) {
  const { t } = useTranslation('pageCart');
  return (
    <PageContainer className="py-24 tablet:py-32">
      <BackButton label={t('back')} />
      <PageBreadcrumb label={t('breadcrumb')} items={[{ label: t('crumbHome'), to: '/' }, { label: heading }]} />
      <h1 className="mb-24 text-heading-28-bold text-foreground">{heading}</h1>
      <div className="flex flex-col gap-32 desktop:grid desktop:grid-cols-[1fr_405px] desktop:gap-48">
        <div>{main}</div>
        {aside ? <aside className="flex flex-col gap-24">{aside}</aside> : null}
      </div>
      {footer ? <div className="mt-48">{footer}</div> : null}
    </PageContainer>
  );
}
