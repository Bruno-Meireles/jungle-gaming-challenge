import type { ptBRResources } from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: readonly [
      'shared',
      'header',
      'bottomNav',
      'nft',
      'catalog',
      'footer',
      'hero',
      'featured',
      'language',
      'auth',
      'filters',
      'sort',
      'search',
      'viewTabs',
      'pageHome',
      'pageUnavailable',
      'pageNotFound',
      'pageLogin',
      'pageSignup',
      'authSurface',
    ];
    resources: typeof ptBRResources;
  }
}
