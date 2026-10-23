import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import '../../../app/styles.css';
import { createI18n } from '../../../app/i18n/init';
import { resources } from '../../../app/i18n/resources';
import { AuthSurface, authSurfaceLocales } from '..';

const CLOSE = { 'pt-BR': 'Fechar', en: 'Close' } as const;

function mount(locale: 'pt-BR' | 'en', onDismiss = () => {}) {
  const i18n = createI18n({ resources, locale });
  return render(
    <I18nextProvider i18n={i18n}>
      <AuthSurface title="Entrar" subtitle="Subtítulo de teste" onDismiss={onDismiss} footer={<a href="/x">Rodapé link</a>}>
        <button type="button">Conteúdo</button>
      </AuthSurface>
    </I18nextProvider>,
  );
}

afterEach(() => page.viewport(1440, 900));

describe('authSurfaceLocales', () => {
  it('traz a chave close em pt-BR e en', () => {
    expect(authSurfaceLocales['pt-BR']).toHaveProperty('close', CLOSE['pt-BR']);
    expect(authSurfaceLocales.en).toHaveProperty('close', CLOSE.en);
  });
});

describe.each(['pt-BR', 'en'] as const)('AuthSurface (%s)', (locale) => {
  it('desktop: renderiza dialog nomeado pelo title com children, footer e botao fechar i18n', async () => {
    await page.viewport(1440, 900);
    await mount(locale);
    await expect.element(page.getByRole('dialog', { name: 'Entrar' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Conteúdo' })).toBeVisible();
    await expect.element(page.getByRole('link', { name: 'Rodapé link' })).toBeVisible();
    await expect.element(page.getByText('Subtítulo de teste')).toBeVisible();
    await expect.element(page.getByRole('button', { name: CLOSE[locale], exact: true })).toBeVisible();
  });

  it('desktop: Esc e o botao fechar chamam onDismiss', async () => {
    await page.viewport(1440, 900);
    const onDismiss = vi.fn();
    await mount(locale, onDismiss);
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalledTimes(1);
    await page.getByRole('button', { name: CLOSE[locale], exact: true }).click();
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('desktop: o foco inicial fica dentro do dialog', async () => {
    await page.viewport(1440, 900);
    await mount(locale);
    const dialog = page.getByRole('dialog');
    await expect.element(dialog).toBeVisible();
    await expect.poll(() => dialog.element().contains(document.activeElement)).toBe(true);
  });

  it('mobile: sem dialog; section com h1 do title, subtitle, children e footer', async () => {
    await page.viewport(390, 844);
    await mount(locale);
    await expect.element(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible();
    expect(page.getByRole('dialog').elements()).toHaveLength(0);
    await expect.element(page.getByText('Subtítulo de teste')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Conteúdo' })).toBeVisible();
    await expect.element(page.getByRole('link', { name: 'Rodapé link' })).toBeVisible();
  });
});
