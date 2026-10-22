import type { ptBRResources } from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: readonly [
      'shared',
      'header',
      'nft',
      'footer',
      'pageHome',
      'pageUnavailable',
      'pageNotFound',
    ];
    resources: typeof ptBRResources;
  }
}
