import { useTranslation } from 'react-i18next';

import { ProfileEditor } from '../../../features/edit-profile';
import { useDocumentMeta } from '../../../shared/hooks';

export function AccountProfilePage() {
  const { t } = useTranslation('pageAccount');
  useDocumentMeta({ title: t('profile.title'), description: t('profile.description') });
  return (
    <section className="flex flex-col gap-24">
      <h1 className="text-title-22-regular text-foreground">{t('profile.heading')}</h1>
      <ProfileEditor />
    </section>
  );
}
