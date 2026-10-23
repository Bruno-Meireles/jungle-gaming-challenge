import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../styles.css';
import { App } from '../App';
import { router } from './router';

describe('rotas de autenticacao (redirect externo)', () => {
  it('descarta redirect externo na URL', async () => {
    await router.navigate({ to: '/login', search: { redirect: '//evil.test' } });
    await render(<App />);
    const link = page.getByRole('link', { name: /crie uma conta|create an account/i });
    await expect.element(link).toHaveAttribute('href', '/signup');
  });
});
