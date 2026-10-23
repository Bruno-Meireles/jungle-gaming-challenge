import { Badge, NftCard } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { resolveLocale } from '../../../shared/lib/i18n/resolve-locale';
import type { NftSummary } from '../model/domain/nft';
import { toCardViewModel, type Translate } from '../model/to-card-view-model';

export function NftCardView({ nft }: { nft: NftSummary }) {
  const { t, i18n } = useTranslation();
  const locale = resolveLocale({ saved: i18n.language, languages: [] });
  // Porta do dominio com chaves tipadas: so as duas chaves usadas por toCardViewModel.
  const translate: Translate = (key, options = {}) =>
    key === 'nft:image.alt'
      ? t('nft:image.alt', { title: options.title ?? '' })
      : t('shared:eth.amount', { amount: options.amount ?? '' });
  const vm = toCardViewModel(nft, { locale, t: translate });
  return (
    <NftCard
      title={vm.title}
      priceLabel={vm.priceLabel}
      image={vm.image}
      badge={vm.isRare ? <Badge variant="label">{t('nft:badge.rare')}</Badge> : undefined}
      link={<Link to="/nfts/$nftId" params={{ nftId: vm.id }} search={{ tab: 'details' }} />}
    />
  );
}
