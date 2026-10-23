import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../styles.css';
import { App } from '../App';
import { router } from './router';

describe('rotas de autenticacao', () => {
  it('/login?redirect=... abre o dialogo de login e a alternancia preserva o redirect', async () => {
    await router.navigate({ to: '/login', search: { redirect: '/cart' } });
    await render(<App />);
    await expect.element(page.getByRole('dialog', { name: /entrar|sign in/i })).toBeInTheDocument();
    const link = page.getByRole('link', { name: /crie uma conta|create an account/i });
    await expect.element(link).toHaveAttribute('href', '/signup?redirect=%2Fcart');
  });
});
