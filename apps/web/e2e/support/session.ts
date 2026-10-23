import { expect, type Page } from '@playwright/test';

export const ANA = { email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' };
export const BRUNO = { email: 'bruno@example.test', password: 'JungleDemo-Bruno-2026!' };

/** Escolhe o cenario de mocks antes do primeiro carregamento (estado isolado por contexto de teste). */
export async function useScenario(page: Page, scenario: string): Promise<void> {
  await page.addInitScript((id) => localStorage.setItem('jg:mocks:scenario', id), scenario);
}

export async function login(page: Page, credentials = ANA, path = '/login'): Promise<void> {
  await page.goto(path);
  await page.getByLabel('E-mail', { exact: true }).fill(credentials.email);
  await page.getByLabel('Senha', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
}

export async function loginToHome(page: Page, credentials = ANA): Promise<void> {
  await login(page, credentials);
  await expect(page).toHaveURL(/\/$/);
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
}

export async function addFirstEditionToCart(page: Page, nftId = 'emerald-ape-042'): Promise<void> {
  await page.goto(`/nfts/${nftId}`);
  await page.getByRole('button', { name: 'Comprar', exact: true }).click();
  await expect(page).toHaveURL(/\/cart$/);
}
