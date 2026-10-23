import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useCatalogSearch } from '../../../entities/nft';
import { SearchToggle } from '../../../features/catalog-search';
import { PageContainer } from '../../../shared/ui';
import { CartLink } from './CartLink';
import { HeaderNav } from './HeaderNav';
import { HeaderSession } from './HeaderSession';

export function Header() {
  const { t } = useTranslation(['header', 'shared']);
  const { search, update } = useCatalogSearch();
  return (
    <header aria-label={t('header:label')} className="pt-16 tablet:pt-24">
      <PageContainer>
        <div className="flex items-start justify-between gap-16 border-b border-primary pb-0">
          <Link
            to="/"
            className="flex h-34 w-48 items-start text-body-14-bold-lh-auto uppercase text-foreground tablet:w-160"
          >
            {t('shared:brand')}
          </Link>
          <HeaderNav />
          <div className="flex items-start gap-16 pb-8 desktop:gap-28">
            <SearchToggle value={search.q} onSubmit={(q) => update({ q })} />
            <CartLink />
            <HeaderSession />
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
