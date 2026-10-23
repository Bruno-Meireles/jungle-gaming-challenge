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

export function CheckoutPage({ form, wallet, ...view }: CheckoutPageProps) {
  const { t } = useTranslation('pageCheckout');
  useDocumentMeta({ title: t('title'), description: t('description') });
  return (
    <PageContainer className="py-24 tablet:py-32">
      <h1 className="mb-24 text-heading-28-bold text-foreground">{t('heading')}</h1>
      <div className="flex flex-col gap-32 desktop:grid desktop:grid-cols-[1fr_405px] desktop:gap-48">
        <div className="flex flex-col gap-32">
          <section aria-label={t('collector')}>
            <CollectorForm {...form} />
          </section>
          <section aria-label={t('wallet')}>
            <WalletNetworkPicker {...wallet} />
          </section>
        </div>
        <CheckoutView {...view} />
      </div>
    </PageContainer>
  );
}
