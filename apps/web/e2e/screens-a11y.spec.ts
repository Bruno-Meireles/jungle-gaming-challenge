import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/*
 * Todas as telas: sem violacoes axe (WCAG 2.x A/AA + best-practice), sem rolagem horizontal, em pt-BR e en.
 * Os testes sem "@tablet" rodam em 1440 e 390; os com "@tablet" rodam em 768.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const ANA = { email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' };

type Screen = { name: string; path: string; auth?: boolean; ready: (page: Page) => Promise<void> };

const heading = (page: Page) => page.getByRole('heading').first();

const SCREENS: Screen[] = [
  { name: 'detalhe', path: '/nfts/emerald-ape-042', ready: async (page) => expect(page.getByRole('heading', { level: 1 })).toBeVisible() },
  { name: 'carrinho vazio', path: '/cart', ready: async (page) => expect(page.getByRole('heading', { level: 1 })).toBeVisible() },
  { name: 'carrinho', path: '/cart', auth: true, ready: async (page) => expect(page.getByRole('list', { name: /Itens do carrinho|Cart items/ })).toBeVisible() },
  { name: 'pagamento', path: '/checkout', auth: true, ready: async (page) => expect(page.getByRole('heading', { level: 1 })).toBeVisible() },
  { name: 'recibo', path: '/orders/ord-ana-0001', auth: true, ready: async (page) => expect(heading(page)).toBeVisible() },
  { name: 'perfil', path: '/account/profile', auth: true, ready: async (page) => expect(page.getByRole('heading', { level: 1 })).toBeVisible() },
  { name: 'carteiras', path: '/account/wallets', auth: true, ready: async (page) => expect(page.getByRole('heading', { level: 1 })).toBeVisible() },
  { name: 'login', path: '/login', ready: async (page) => expect(page.getByRole('heading', { name: /Entrar|Sign in/ }).first()).toBeVisible() },
  { name: 'cadastro', path: '/signup', ready: async (page) => expect(page.getByRole('heading', { name: /Criar|Create|Cadastr|Sign/ }).first()).toBeVisible() },
  { name: '404', path: '/rota-inexistente', ready: async (page) => expect(page.getByRole('heading', { level: 1 })).toBeVisible() },
  { name: 'indisponivel', path: '/unavailable?feature=support', ready: async (page) => expect(page.getByRole('heading', { level: 1 })).toBeVisible() },
];

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/^(E-mail|Email)$/).fill(ANA.email);
  await page.getByLabel(/^(Senha|Password)$/).fill(ANA.password);
  await page.getByRole('button', { name: /^(Entrar|Sign in)$/ }).last().click();
  await expect(page).toHaveURL(/\/$/);
}

for (const tag of ['', '@tablet ']) {
  for (const locale of ['pt-BR', 'en'] as const) {
    test.describe(`${tag}telas (${locale})`, () => {
      for (const screen of SCREENS) {
        test(`${tag}${screen.name} (${locale}): axe e sem rolagem horizontal`, async ({ page }) => {
          await page.addInitScript((value) => localStorage.setItem('jg:locale', value), locale);
          if (screen.auth) await signIn(page);
          await page.goto(screen.path);
          await screen.ready(page);
          await page.waitForTimeout(400);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow, 'rolagem horizontal').toBeLessThanOrEqual(0);
          const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
          expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
        });
      }
    });
  }
}
