import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { cards } from './support/home';

/*
 * Blocos inferiores da Home (Figma 2:2): banners promocionais, "Diario da Cunhagem" (4 cards) e Footer completo.
 * Roda em desktop-1440 e mobile-390; textos conferidos em docs/figma/file.json (nos 70353:*, 70343:*, 70492:696).
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function openHome(page: Page, locale: 'pt-BR' | 'en' = 'pt-BR') {
  await page.addInitScript((value) => localStorage.setItem('jg:locale', value), locale);
  await page.goto('/');
  await expect(cards(page).first()).toBeVisible();
}

test.describe('home: banners, diario e rodape', () => {
  test('banners promocionais levam ao catalogo filtrado', async ({ page }) => {
    await openHome(page);
    const promos = page.getByRole('region', { name: 'Destaques e promoções' });
    await expect(promos.getByRole('heading', { level: 3 })).toHaveText([
      'Lançamentos gênesis de edição limitada',
      'Arte digital selecionada e muito mais',
    ]);
    await promos.getByRole('link', { name: 'Explorar' }).first().click();
    await expect(page).toHaveURL(/tab=new/);
  });

  test('Diario da Cunhagem mostra 4 artigos com data e leitura', async ({ page }) => {
    await openHome(page);
    const journal = page.getByRole('region', { name: 'Diário da Cunhagem' });
    await expect(journal.getByRole('heading', { level: 2 })).toHaveText('Diário da Cunhagem');
    await expect(journal.getByRole('article')).toHaveCount(4);
    await expect(journal.getByText('12 de setembro | Leitura de 6 min')).toBeVisible();
    await expect(journal.getByRole('link', { name: 'Ler mais sobre Como proteger sua carteira' })).toBeVisible();
  });

  test('rodape traz pilares, newsletter, contatos, colunas e copyright', async ({ page }) => {
    await openHome(page);
    const footer = page.getByRole('contentinfo', { name: 'Rodapé do site' });
    await footer.scrollIntoViewIfNeeded();
    for (const title of ['Segurança da carteira', 'Criadores em destaque', 'Alertas de lançamentos', 'Antecipe-se ao próximo lançamento']) {
      await expect(footer.getByRole('heading', { name: title })).toBeVisible();
    }
    await expect(footer.getByRole('link', { name: 'contato@email.com' })).toHaveAttribute('href', 'mailto:contato@email.com');
    await expect(footer.getByRole('link', { name: '+55 11 4002 8922' })).toBeVisible();
    for (const column of ['Meu perfil', 'Central de ajuda', 'Coleções', 'Redes sociais', 'Carteiras compatíveis']) {
      await expect(footer.getByRole('heading', { name: column })).toBeVisible();
    }
    await expect(footer.getByText('© 2026 Kurio. Propriedade digital para todos.')).toBeVisible();
  });

  test('newsletter valida o e-mail e nao aparenta sucesso', async ({ page }) => {
    await openHome(page);
    const footer = page.getByRole('contentinfo', { name: 'Rodapé do site' });
    await footer.getByRole('button', { name: 'Enviar' }).click();
    await expect(footer.getByText('Informe seu e-mail.')).toBeVisible();
    await footer.getByLabel('E-mail para receber novidades').fill('invalido');
    await footer.getByRole('button', { name: 'Enviar' }).click();
    await expect(footer.getByText('Informe um e-mail válido.')).toBeVisible();
    await footer.getByLabel('E-mail para receber novidades').fill('ana@example.test');
    await footer.getByRole('button', { name: 'Enviar' }).click();
    await expect(footer.getByText('ainda não está disponível nesta demonstração')).toBeVisible();
  });

  test('links do rodape sem funcionalidade levam a pagina de indisponivel; colecoes filtram', async ({ page }) => {
    await openHome(page);
    const footer = page.getByRole('contentinfo', { name: 'Rodapé do site' });
    await footer.getByRole('link', { name: 'Fotografia' }).click();
    await expect(page).toHaveURL(/collections=photography/);
    await footer.getByRole('link', { name: 'Atividade' }).click();
    await expect(page).toHaveURL(/unavailable\?feature=activity/);
  });

  test('em ingles os blocos sao traduzidos', async ({ page }) => {
    await openHome(page, 'en');
    await expect(page.getByRole('heading', { level: 2, name: 'Minting Journal' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Wallet security' })).toBeVisible();
    await expect(page.getByText('© 2026 Kurio. Digital ownership for everyone.')).toBeVisible();
  });

  test('sem rolagem horizontal e sem violacoes de acessibilidade', async ({ page }) => {
    await openHome(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });
});

test('@tablet home em 768 sem rolagem horizontal e com rodape completo', async ({ page }) => {
  await openHome(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByRole('region', { name: 'Diário da Cunhagem' }).getByRole('article')).toHaveCount(4);
  await expect(page.getByRole('contentinfo', { name: 'Rodapé do site' }).getByRole('heading', { name: 'Redes sociais' })).toBeVisible();
});
