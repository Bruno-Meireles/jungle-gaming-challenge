import { Button } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { LanguageSwitch } from '../../../features/language-switch';
import { CartIcon, LoginIcon, PageContainer } from '../../../shared/ui';
import { HeaderNav } from './HeaderNav';

export function Header() {
  const { t } = useTranslation(['header', 'shared']);
  return (
    <header aria-label={t('header:label')} className="pt-16 tablet:pt-24">
      <PageContainer>
        <div className="flex items-start justify-between gap-16 border-b border-border pb-0">
          <Link
            to="/"
            className="flex h-34 w-48 items-start text-body-14-bold-lh-auto uppercase text-foreground tablet:w-160"
          >
            {t('shared:brand')}
          </Link>
          <HeaderNav />
          <div className="flex items-start gap-16 pb-8 desktop:gap-28">
            <div className="hidden desktop:block">
              <LanguageSwitch />
            </div>
            <Link
              to="/cart"
              aria-label={t('header:cart')}
              className="flex size-35 items-center justify-center text-foreground focus-visible:outline-2 focus-visible:outline-focus"
            >
              <CartIcon />
            </Link>
            <Button asChild className="h-35 gap-4 rounded-6 px-9 text-body-large-16-medium-lh-16">
              <Link to="/login">
                <LoginIcon />
                {t('header:login')}
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
