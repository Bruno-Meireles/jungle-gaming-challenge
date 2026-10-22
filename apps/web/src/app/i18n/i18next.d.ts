import type { ptBRResources } from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: readonly ['shared', 'header', 'footer', 'pageHome'];
    resources: typeof ptBRResources;
  }
}
