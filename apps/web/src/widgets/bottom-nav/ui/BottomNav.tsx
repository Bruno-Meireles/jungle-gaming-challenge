import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CartIcon, HeartIcon, HomeIcon, ScanIcon, UserIcon } from '../../../shared/ui';

const ITEM =
  'flex size-44 items-center justify-center text-text-secondary hover:text-text-accent data-[status=active]:text-text-accent [&>svg]:size-20';

/*
 * Barra inferior so abaixo de 768 (Figma 14:5226, Tab Bar 70395:245: 414x126, fundo surface com sombra, botao central
 * de 65 elevado). Desvio: o entalhe do vetor 15:5504 nao e replicado (topo arredondado simples). Os itens sao so icones
 * no Figma; o nome acessivel vem de `aria-label`. O espacador reserva a altura para nao cobrir o fim da pagina.
 */
export function BottomNav() {
  const { t } = useTranslation('bottomNav');
  return (
    <div className="tablet:hidden">
      <div aria-hidden="true" className="h-95" />
      <nav
        aria-label={t('label')}
        className="fixed inset-x-0 bottom-0 z-30 h-95 rounded-t-30 bg-surface-card shadow-[0_-10px_30px_rgba(10,6,4,0.45)]"
      >
        <ul className="mx-auto flex h-full max-w-[414px] items-center justify-between px-24 pt-8">
          <li>
            <Link to="/" aria-label={t('home')} className={ITEM} activeOptions={{ exact: true }}>
              <HomeIcon />
            </Link>
          </li>
          <li>
            <Link to="/unavailable" search={{ feature: 'favorites' }} aria-label={t('favorites')} className={ITEM}>
              <HeartIcon />
            </Link>
          </li>
          <li className="self-start -mt-39">
            <Link
              to="/unavailable"
              search={{ feature: 'scan' }}
              aria-label={t('scan')}
              className="flex size-65 items-center justify-center rounded-full bg-linear-to-b from-primary-light to-primary text-ink [&>svg]:h-24 [&>svg]:w-[26.82px]"
            >
              <ScanIcon />
            </Link>
          </li>
          <li>
            <Link to="/cart" aria-label={t('shop')} className={ITEM}>
              <CartIcon />
            </Link>
          </li>
          <li>
            <Link to="/login" aria-label={t('profile')} className={ITEM}>
              <UserIcon />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
