import { useTranslation } from 'react-i18next';

import { LanguageSwitch } from '../../../features/language-switch';
import { PageContainer } from '../../../shared/ui';
import { FooterBar } from './FooterBar';
import { FooterLinks } from './FooterLinks';
import { FooterNewsletter } from './FooterNewsletter';
import { FooterPillars } from './FooterPillars';

export function Footer() {
  const { t } = useTranslation('footer');
  return (
    <footer aria-label={t('label')} className="mt-48 pb-96 tablet:pb-48 desktop:mt-96 desktop:pb-48">
      <PageContainer>
        <div className="overflow-hidden rounded-8">
          <div className="flex flex-col gap-24 bg-surface-card p-24 desktop:grid desktop:grid-cols-[1fr_1fr_1fr_357px] desktop:gap-0 desktop:px-32">
            <FooterPillars />
            <FooterNewsletter />
          </div>
          <FooterBar />
          <FooterLinks />
          <div className="flex flex-col items-center gap-12 bg-surface-card px-24 py-16 tablet:flex-row tablet:justify-between">
            <p className="text-body-14-regular-lh-16 text-text-secondary">{t('copyright')}</p>
            <LanguageSwitch />
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
