import { expect, test } from '@playwright/test';
import { ANA, BRUNO, login, loginToHome, logout, useScenario } from './support/session';

/* Plano de testes §9 itens 3 e 8: cadastro, login, expiracao, logout, troca de usuario, perfil, avatar, senha, carteiras. */

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test.describe('cadastro e login', () => {
  test('cadastro cria a conta, autentica e persiste apos refresh', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Nome de usuário').fill('novo_colecionador');
    await page.getByLabel('E-mail', { exact: true }).fill('novo@example.test');
    await page.getByLabel('Senha', { exact: true }).fill('SenhaForte-2026!');
    await page.getByLabel('Confirmar senha').fill('SenhaForte-2026!');
    await page.getByRole('button', { name: 'Criar conta', exact: true }).last().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible();
  });

  test('cadastro com e-mail existente mostra conflito no campo', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Nome de usuário').fill('outro_usuario');
    await page.getByLabel('E-mail', { exact: true }).fill(ANA.email);
    await page.getByLabel('Senha', { exact: true }).fill('SenhaForte-2026!');
    await page.getByLabel('Confirmar senha').fill('SenhaForte-2026!');
    await page.getByRole('button', { name: 'Criar conta', exact: true }).last().click();
    await expect(page.getByText('Este e-mail já está em uso')).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('validacao do cadastro: senhas diferentes e campos vazios', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('button', { name: 'Criar conta', exact: true }).last().click();
    await expect(page.getByText('Campo obrigatório').first()).toBeVisible();
    await page.getByLabel('Nome de usuário').fill('usuario_ok');
    await page.getByLabel('E-mail', { exact: true }).fill('ok@example.test');
    await page.getByLabel('Senha', { exact: true }).fill('SenhaForte-2026!');
    await page.getByLabel('Confirmar senha').fill('diferente-123');
    await page.getByRole('button', { name: 'Criar conta', exact: true }).last().click();
    await expect(page.getByText('As senhas não coincidem')).toBeVisible();
  });

  test('credenciais invalidas mostram erro e nao autenticam', async ({ page }) => {
    await login(page, { email: ANA.email, password: 'errada-123456' });
    await expect(page.getByText('E-mail ou senha incorretos')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('falha de rede no login mostra erro recuperavel', async ({ page }) => {
    await useScenario(page, 'auth_network_error');
    await login(page);
    await expect(page.getByText('Não foi possível conectar. Verifique sua conexão.')).toBeVisible();
  });

  test('sessao expirada: token invalido leva ao login preservando o destino', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('jg.session.token', 'token-expirado'));
    await page.goto('/account/profile');
    await expect(page).toHaveURL(/\/login\?redirect=%2Faccount%2Fprofile/);
    await login(page, ANA, '/login?redirect=%2Faccount%2Fprofile');
    await expect(page).toHaveURL(/\/account\/profile$/);
  });

  test('logout limpa a sessao e troca de usuario nao vaza dados privados', async ({ page }) => {
    await loginToHome(page, ANA);
    await page.goto('/account/wallets');
    await expect(page.getByRole('heading', { level: 1, name: 'Carteiras' })).toBeVisible();
    await expect(page.getByLabel('Endereço da carteira').first()).toHaveValue(/^0x[0-9a-fA-F]{40}$/);
    await page.goto('/');
    await logout(page);
    await loginToHome(page, BRUNO);
    await page.goto('/account/wallets');
    await expect(page.getByText('Você ainda não adicionou uma carteira principal.')).toBeVisible();
  });
});

test.describe('perfil e carteiras', () => {
  test('editar perfil persiste apos refresh e valida erros da API', async ({ page }) => {
    await loginToHome(page);
    await page.goto('/account/profile');
    const name = page.getByLabel('Nome de exibição');
    await expect(name).not.toHaveValue('');
    await name.fill('Ana Colecionadora');
    await page.getByRole('button', { name: 'Salvar', exact: true }).first().click();
    await expect(page.getByText('Perfil atualizado')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Colecionadora');
    await page.getByLabel('E-mail', { exact: true }).fill(BRUNO.email);
    await page.getByRole('button', { name: 'Salvar', exact: true }).first().click();
    await expect(page.getByText('Este e-mail já está em uso')).toBeVisible();
  });

  test('avatar aceita imagem valida e recusa tipo invalido', async ({ page }) => {
    await loginToHome(page);
    await page.goto('/account/profile');
    const input = page.locator('input[type="file"]');
    await input.setInputFiles({ name: 'nota.txt', mimeType: 'text/plain', buffer: Buffer.from('nao e imagem') });
    await expect(page.getByText('Use uma imagem PNG, JPEG ou WebP')).toBeVisible();
    await input.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PNG_1PX });
    await expect(page.getByRole('img', { name: 'Foto de perfil' })).toBeVisible();
  });

  test('alterar senha: senha atual errada e confirmacao divergente', async ({ page }) => {
    await loginToHome(page);
    await page.goto('/account/profile');
    await page.getByLabel('Senha atual').fill('errada-123456');
    await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha-2026!');
    await page.getByLabel('Confirmar nova senha').fill('Outra-2026!!!');
    await page.getByRole('button', { name: 'Salvar', exact: true }).last().click();
    await expect(page.getByText('As senhas não coincidem')).toBeVisible();
    await page.getByLabel('Confirmar nova senha').fill('NovaSenha-2026!');
    await page.getByRole('button', { name: 'Salvar', exact: true }).last().click();
    await expect(page.getByText('Senha atual incorreta')).toBeVisible();
  });

  test('carteiras: endereco invalido e cadastro da principal persistem apos refresh', async ({ page }) => {
    await loginToHome(page, BRUNO);
    await page.goto('/account/wallets');
    await page.getByRole('button', { name: 'Adicionar' }).first().click();
    await page.getByLabel('Endereço da carteira').fill('0x123');
    await page.getByRole('button', { name: 'Salvar', exact: true }).first().click();
    await expect(page.getByText('Endereço de carteira inválido')).toBeVisible();
    await page.getByLabel('Endereço da carteira').fill('0x1111111111111111111111111111111111111111');
    await page.getByRole('button', { name: 'Salvar', exact: true }).first().click();
    await expect(page.getByText('Carteira salva')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Endereço da carteira').first()).toHaveValue('0x1111111111111111111111111111111111111111');
  });
});
