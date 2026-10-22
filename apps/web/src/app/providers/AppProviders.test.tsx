import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import type { Resources } from '../i18n/resources';
import { AppProviders } from './AppProviders';

const resources: Resources = {
  'pt-BR': { demo: { greeting: 'Olá' } },
  en: { demo: { greeting: 'Hello' } },
};

function Greeting() {
  const { t } = useTranslation('demo');
  return <p data-testid="greeting">{t('greeting')}</p>;
}

function Switcher() {
  const { i18n } = useTranslation();
  return (
    <button type="button" onClick={() => void i18n.changeLanguage('en')}>
      {i18n.language}
    </button>
  );
}

function Probe() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {`count-${count}`}
    </button>
  );
}

function ClientProbe() {
  const client = useQueryClient();
  return <p data-testid="client">{client ? 'ok' : 'none'}</p>;
}

function spyLanguages(languages: string[]) {
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(languages);
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('lang');
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  document.documentElement.removeAttribute('lang');
});

describe('AppProviders', () => {
  it('usa o idioma do navegador pt-BR quando nao ha preferencia salva', async () => {
    spyLanguages(['pt-BR']);
    await render(
      <AppProviders resources={resources}>
        <Greeting />
      </AppProviders>,
    );
    await expect.element(page.getByTestId('greeting')).toHaveTextContent('Olá');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('usa o idioma do navegador en quando nao ha preferencia salva', async () => {
    spyLanguages(['en-US']);
    await render(
      <AppProviders resources={resources}>
        <Greeting />
      </AppProviders>,
    );
    await expect.element(page.getByTestId('greeting')).toHaveTextContent('Hello');
    expect(document.documentElement.lang).toBe('en');
  });

  it('preferencia salva en vence o idioma do navegador', async () => {
    spyLanguages(['pt-BR']);
    localStorage.setItem('jg:locale', 'en');
    await render(
      <AppProviders resources={resources}>
        <Greeting />
      </AppProviders>,
    );
    await expect.element(page.getByTestId('greeting')).toHaveTextContent('Hello');
    expect(document.documentElement.lang).toBe('en');
  });

  it('trocar o idioma atualiza texto, lang e preferencia sem remontar os filhos', async () => {
    spyLanguages(['pt-BR']);
    await render(
      <AppProviders resources={resources}>
        <Greeting />
        <Switcher />
        <Probe />
      </AppProviders>,
    );
    await page.getByRole('button', { name: 'count-0' }).click();
    await expect.element(page.getByRole('button', { name: 'count-1' })).toBeVisible();

    await page.getByRole('button', { name: 'pt-BR' }).click();

    await expect.element(page.getByTestId('greeting')).toHaveTextContent('Hello');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('jg:locale')).toBe('en');
    await expect.element(page.getByRole('button', { name: 'count-1' })).toBeVisible();
  });

  it('disponibiliza o QueryClient aos filhos', async () => {
    await render(
      <AppProviders resources={resources}>
        <ClientProbe />
      </AppProviders>,
    );
    await expect.element(page.getByTestId('client')).toHaveTextContent('ok');
  });
});
