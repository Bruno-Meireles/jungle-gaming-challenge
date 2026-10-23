import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { render } from 'vitest-browser-react';

import '../app/styles.css';
import { createI18n } from '../app/i18n/init';
import { resources } from '../app/i18n/resources';
import type { Edition, NftDetail } from '../entities/nft';

export type Locale = 'pt-BR' | 'en';

export const soldOutEdition: Edition = { id: '1-1', kind: { type: 'limited', size: 1 }, priceEth: '3.50', remaining: 0, maxPerOrder: 1 };
export const smallEdition: Edition = { id: '1-10', kind: { type: 'limited', size: 10 }, priceEth: '1.69', remaining: 3, maxPerOrder: 3 };
export const defaultEdition: Edition = { id: '1-50', kind: { type: 'limited', size: 50 }, priceEth: '1.19', remaining: 20, maxPerOrder: 5 };
export const openEdition: Edition = { id: 'open', kind: { type: 'open' }, priceEth: '0.25', remaining: 999, maxPerOrder: 10 };
export const editions: Edition[] = [soldOutEdition, smallEdition, defaultEdition, openEdition];

export const nft: NftDetail = {
  id: 'emerald-ape-042',
  title: 'Emerald Ape #042',
  description: { 'pt-BR': 'Um macaco esmeralda raro.', en: 'A rare emerald ape.' },
  tokenId: '#0042',
  rating: { average: 4.8, count: 124 },
  gallery: [
    { src: '/img/ape-1.png', width: 800, height: 800 },
    { src: '/img/ape-2.png', width: 800, height: 800 },
    { src: '/img/ape-3.png', width: 800, height: 800 },
  ],
  contract: { address: '0x1234567890abcdef1234567890abcdef12345678', standard: 'ERC-721' },
  royaltyPercent: 5,
  attributes: [{ name: { 'pt-BR': 'Fundo', en: 'Background' }, value: { 'pt-BR': 'Verde', en: 'Green' } }],
  editions,
  defaultEditionId: '1-50',
};

/** Monta `ui` dentro de i18n real e de um router em memoria (rotas stub `/`, `/login`, `/unavailable`). */
export async function mountWithRouter(locale: Locale, ui: ReactNode, initial = '/nfts/emerald-ape-042') {
  const rootRoute = createRootRoute({ component: () => <>{ui}</> });
  const stub = (path: string) => createRoute({ getParentRoute: () => rootRoute, path });
  const router = createRouter({
    routeTree: rootRoute.addChildren([stub('/'), stub('/login'), stub('/unavailable'), stub('/nfts/$nftId')]),
    history: createMemoryHistory({ initialEntries: [initial] }),
  });
  const i18n = createI18n({ resources, locale });
  const screen = await render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </QueryClientProvider>,
  );
  return { router, screen };
}
