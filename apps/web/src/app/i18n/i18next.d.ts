import type { ptBRResources } from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: readonly [
      'shared',
      'header',
      'nft',
      'catalog',
      'footer',
      'hero',
      'featured',
      'language',
      'filters',
      'sort',
      'search',
      'viewTabs',
      'pageHome',
      'pageUnavailable',
      'pageNotFound',
    ];
    resources: typeof ptBRResources;
  }
}
