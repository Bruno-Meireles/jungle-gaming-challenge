import { useId, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CollectorForm, type CollectorFormProps } from '../../../features/collector-form';
import { WalletNetworkPicker, type WalletNetworkPickerProps } from '../../../features/wallet-connect';
import { useDocumentMeta } from '../../../shared/hooks';
import { PageContainer } from '../../../shared/ui';
import { CheckoutView, type CheckoutViewProps } from '../../../widgets/checkout';

export type CheckoutPageProps = CheckoutViewProps & {
  form: CollectorFormProps;
  wallet: WalletNetworkPickerProps;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-16">
      <h2 id={headingId} className="text-body-large-17-bold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckoutPage({ form, wallet, ...view }: CheckoutPageProps) {
  const { t } = useTranslation('pageCheckout');
  useDocumentMeta({ title: t('title'), description: t('description') });
  return (
    <PageContainer className="py-24 tablet:py-32">
      <h1 className="mb-24 text-title-20-bold-lh-16 text-foreground tablet:text-heading-28-bold">{t('heading')}</h1>
      <div className="flex flex-col gap-32 desktop:grid desktop:grid-cols-[1fr_405px] desktop:gap-48">
        <Section title={t('collector')}>
          <CollectorForm {...form} />
        </Section>
        <CheckoutView
          {...view}
          beforeConfirm={
            <Section title={t('wallet')}>
              <WalletNetworkPicker {...wallet} />
            </Section>
          }
        />
      </div>
    </PageContainer>
  );
}
