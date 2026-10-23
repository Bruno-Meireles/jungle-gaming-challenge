import { RouterProvider, createBrowserHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import '../../../app/styles.css';
import { AppProviders } from '../../../app/providers/AppProviders';
import { LanguageSwitch } from './LanguageSwitch';

const ORIGINAL_URL = location.pathname + location.search;

function renderAt(url: string) {
  history.replaceState(null, '', url);
  const root = createRootRoute({ component: LanguageSwitch });
  const route = createRoute({ getParentRoute: () => root, path: '/catalogo/$id', component: () => null });
  const router = createRouter({ routeTree: root.addChildren([route]), history: createBrowserHistory() });
  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
}

afterEach(() => {
  history.replaceState(null, '', ORIGINAL_URL);
  localStorage.clear();
});

describe('LanguageSwitch', () => {
  it('trocar o idioma grava ?lang= preservando rota e demais parametros, salva a preferencia e atualiza html lang', async () => {
    localStorage.clear();
    await renderAt('/catalogo/ape-1?q=ape&page=2&lang=pt-BR');
    await page.getByRole('combobox', { name: 'Idioma' }).click();
    await page.getByRole('option', { name: 'English' }).click();

    await expect.poll(() => location.pathname + location.search).toBe('/catalogo/ape-1?q=ape&page=2&lang=en');
    expect(localStorage.getItem('jg:locale')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    await expect.element(page.getByRole('combobox', { name: 'Language' })).toBeVisible();
  });

  it('expoe o rotulo acessivel e as opcoes nos dois idiomas', async () => {
    await renderAt('/catalogo/ape-1?lang=en');
    await page.getByRole('combobox', { name: 'Language' }).click();
    await expect.element(page.getByRole('option', { name: 'Português' })).toBeVisible();
    await expect.element(page.getByRole('option', { name: 'English' })).toBeVisible();
  });
});
