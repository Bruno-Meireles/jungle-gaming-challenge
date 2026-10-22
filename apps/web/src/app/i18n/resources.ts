import type { Messages } from '../../shared/lib/i18n/locale-parity';
import { pageHomeLocales } from '../../pages/home';
import { sharedLocales } from '../../shared/config';
import { footerLocales } from '../../widgets/footer';
import { headerLocales } from '../../widgets/header';

export type Resources = { 'pt-BR': Record<string, Messages>; en: Record<string, Messages> };

export const ptBRResources = {
  shared: sharedLocales['pt-BR'],
  header: headerLocales['pt-BR'],
  footer: footerLocales['pt-BR'],
  pageHome: pageHomeLocales['pt-BR'],
};

const enResources = {
  shared: sharedLocales.en,
  header: headerLocales.en,
  footer: footerLocales.en,
  pageHome: pageHomeLocales.en,
} satisfies typeof ptBRResources;

export const resources: Resources = { 'pt-BR': ptBRResources, en: enResources };
