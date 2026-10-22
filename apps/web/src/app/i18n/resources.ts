import type { Messages } from '../../shared/lib/i18n/locale-parity';
import { nftLocales } from '../../entities/nft';
import { pageHomeLocales } from '../../pages/home';
import { pageNotFoundLocales } from '../../pages/not-found';
import { pageUnavailableLocales } from '../../pages/unavailable';
import { sharedLocales } from '../../shared/config';
import { searchLocales } from '../../features/catalog-search';
import { sortLocales } from '../../features/catalog-sort';
import { viewTabsLocales } from '../../features/catalog-view-tabs';
import { filtersLocales } from '../../features/catalog-filters';
import { languageLocales } from '../../features/language-switch';
import { catalogLocales } from '../../widgets/catalog';
import { featuredLocales } from '../../widgets/featured-nft';
import { heroLocales } from '../../widgets/hero';
import { footerLocales } from '../../widgets/footer';
import { headerLocales } from '../../widgets/header';

export type Resources = { 'pt-BR': Record<string, Messages>; en: Record<string, Messages> };

export const ptBRResources = {
  shared: sharedLocales['pt-BR'],
  header: headerLocales['pt-BR'],
  nft: nftLocales['pt-BR'],
  catalog: catalogLocales['pt-BR'],
  footer: footerLocales['pt-BR'],
  hero: heroLocales['pt-BR'],
  featured: featuredLocales['pt-BR'],
  language: languageLocales['pt-BR'],
  filters: filtersLocales['pt-BR'],
  sort: sortLocales['pt-BR'],
  search: searchLocales['pt-BR'],
  viewTabs: viewTabsLocales['pt-BR'],
  pageHome: pageHomeLocales['pt-BR'],
  pageUnavailable: pageUnavailableLocales['pt-BR'],
  pageNotFound: pageNotFoundLocales['pt-BR'],
};

const enResources = {
  shared: sharedLocales.en,
  header: headerLocales.en,
  nft: nftLocales.en,
  catalog: catalogLocales.en,
  footer: footerLocales.en,
  hero: heroLocales.en,
  featured: featuredLocales.en,
  language: languageLocales.en,
  filters: filtersLocales.en,
  sort: sortLocales.en,
  search: searchLocales.en,
  viewTabs: viewTabsLocales.en,
  pageHome: pageHomeLocales.en,
  pageUnavailable: pageUnavailableLocales.en,
  pageNotFound: pageNotFoundLocales.en,
} satisfies typeof ptBRResources;

export const resources: Resources = { 'pt-BR': ptBRResources, en: enResources };
