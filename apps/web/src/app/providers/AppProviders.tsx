import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createI18n } from '../i18n/init';
import { resources as defaultResources, type Resources } from '../i18n/resources';
import { readLangParam } from '../../shared/lib/i18n/lang-param';
import { resolveLocale } from '../../shared/lib/i18n/resolve-locale';
import { createQueryClient } from './query-client';
import { RealtimeSessionBridge } from '../realtime/RealtimeSessionBridge';

const LOCALE_STORAGE_KEY = 'jg:locale';

function readSavedLocale(): string | null {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveLocale(locale: string): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // armazenamento indisponivel: a preferencia simplesmente nao persiste
  }
}

export function AppProviders({
  children,
  resources = defaultResources,
}: {
  children: ReactNode;
  resources?: Resources;
}) {
  const [queryClient] = useState(createQueryClient);
  const [i18n] = useState(() =>
    createI18n({ resources, locale: resolveLocale({ url: readLangParam(location.search), saved: readSavedLocale(), languages: navigator.languages }) }),
  );

  useEffect(() => {
    const syncLang = (language: string) => {
      document.documentElement.lang = language;
    };
    const handleChange = (language: string) => {
      saveLocale(language);
      syncLang(language);
    };
    syncLang(i18n.language);
    i18n.on('languageChanged', handleChange);
    return () => i18n.off('languageChanged', handleChange);
  }, [i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <RealtimeSessionBridge />
        {children}
      </I18nextProvider>
    </QueryClientProvider>
  );
}
