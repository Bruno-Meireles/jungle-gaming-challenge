import { useTranslation } from 'react-i18next';

import { WalletsManager } from '../../../features/manage-wallets';
import { useDocumentMeta } from '../../../shared/hooks';

export function AccountWalletsPage() {
  const { t } = useTranslation('pageAccount');
  useDocumentMeta({ title: t('wallets.title'), description: t('wallets.description') });
  return (
    <section className="flex flex-col gap-24">
      <h1 className="text-title-22-regular text-foreground">{t('wallets.heading')}</h1>
      <WalletsManager />
    </section>
  );
}
