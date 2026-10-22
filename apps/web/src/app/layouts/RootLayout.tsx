import { Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Footer } from '../../widgets/footer';
import { Header } from '../../widgets/header';
import { SkipLink } from '../../shared/ui';

export function RootLayout() {
  const { t } = useTranslation('shared');
  return (
    <>
      <SkipLink targetId="content">{t('skipLink')}</SkipLink>
      <Header />
      <main id="content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
