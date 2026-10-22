import { createInstance, type i18n } from 'i18next';
import type { Locale } from '../../shared/lib/i18n/resolve-locale';
import type { Resources } from './resources';

export function createI18n({ resources }: { resources: Resources; locale: Locale }): i18n {
  const instance = createInstance();
  void instance.init({ resources, lng: 'pt-BR', initAsync: false });
  return instance;
}
