import type { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { BackButton, PageBreadcrumb, PageContainer } from '../../../shared/ui';

/** Moldura da tela: titulo + coluna de itens + coluna lateral (resumo, cupom, CTA). */
export function CartPageView({ heading, main, aside, footer }: { heading: string; main: ReactNode; aside?: ReactNode; footer?: ReactNode }) {
  const { t } = useTranslation('pageCart');
  return (
    <PageContainer className="py-24 tablet:py-32">
      <div className="relative mb-24 flex items-center justify-center tablet:mb-0 tablet:block">
        <BackButton label={t('back')} className="absolute left-0 top-1/2 -translate-y-1/2" />
        <PageBreadcrumb label={t('breadcrumb')} items={[{ label: t('crumbHome'), to: '/' }, { label: heading }]} />
        <h1 className="text-center text-title-20-bold-lh-16 text-foreground tablet:mb-24 tablet:text-left tablet:text-heading-28-bold">{heading}</h1>
      </div>
      <div className="flex flex-col gap-32 desktop:grid desktop:grid-cols-[1fr_405px] desktop:gap-48">
        <div>{main}</div>
        {aside ? <aside className="-mx-16 flex flex-col gap-24 rounded-t-32 bg-surface-card px-24 pb-24 pt-24 tablet:mx-0 tablet:rounded-0 tablet:bg-transparent tablet:p-0 [&>:nth-child(1)]:order-2 [&>:nth-child(2)]:order-1 tablet:[&>:nth-child(1)]:order-none tablet:[&>:nth-child(2)]:order-none">{aside}</aside> : null}
      </div>
      {footer ? <div className="mt-48">{footer}</div> : null}
    </PageContainer>
  );
}
