import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { renderCheckoutUi } from '../../../test-support/render-checkout';
import { WalletNetworkPicker } from './WalletNetworkPicker';

type Props = Parameters<typeof WalletNetworkPicker>[0];

const wallets: Props['wallets'] = [
  { id: 'w-eth-1', kind: 'primary', networkId: 'ethereum', address: '0xA91F3b5c7d9e1f2a4b6c8d0e1f3a5b7c9d1eE82C', nickname: null },
  { id: 'w-eth-2', kind: 'secondary', networkId: 'ethereum', address: '0x1234567890abcdef1234567890abcdef1234ABCD', nickname: 'Cofre' },
  { id: 'w-pol-1', kind: 'secondary', networkId: 'polygon', address: '0xFEDCBA0987654321FEDCBA0987654321FEDC0001', nickname: null },
];
const networks: Props['networks'] = [
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'polygon', label: 'Polygon' },
];

const base: Props = {
  networks,
  wallets,
  networkId: 'ethereum',
  walletId: 'w-eth-1',
  connection: { status: 'disconnected', networkId: null },
  onNetworkChange: () => {},
  onWalletSelect: () => {},
  onConnect: () => {},
  onChangeWallet: () => {},
};

describe('WalletNetworkPicker (pt-BR)', () => {
  it('select de rede com as redes e dispara onNetworkChange', async () => {
    const onNetworkChange = vi.fn();
    await renderCheckoutUi(<WalletNetworkPicker {...base} onNetworkChange={onNetworkChange} />);
    const select = page.getByRole('combobox', { name: 'Rede' });
    await expect.element(select).toHaveValue('ethereum');
    await userEvent.selectOptions(select, 'polygon');
    expect(onNetworkChange).toHaveBeenCalledWith('polygon');
  });

  it('lista apenas carteiras da rede, com Principal/Reserva e endereco abreviado', async () => {
    await renderCheckoutUi(<WalletNetworkPicker {...base} />);
    expect(page.getByRole('radio').elements()).toHaveLength(2);
    await expect.element(page.getByRole('radio', { name: /Principal.*0xA91F…E82C/ })).toBeChecked();
    await expect.element(page.getByRole('radio', { name: /Reserva.*0x1234…ABCD/ })).not.toBeChecked();
    expect(page.getByRole('radio', { name: /0xFEDC/ }).query()).toBeNull();
  });

  it('selecionar carteira por clique e por teclado (setas)', async () => {
    const onWalletSelect = vi.fn();
    await renderCheckoutUi(<WalletNetworkPicker {...base} onWalletSelect={onWalletSelect} />);
    await page.getByRole('radio', { name: /Reserva/ }).click();
    expect(onWalletSelect).toHaveBeenLastCalledWith('w-eth-2');
    page.getByRole('radio', { name: /Principal/ }).element().focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onWalletSelect).toHaveBeenLastCalledWith('w-eth-2');
  });

  it('botao Conectar carteira dispara onConnect com a carteira selecionada', async () => {
    const onConnect = vi.fn();
    await renderCheckoutUi(<WalletNetworkPicker {...base} onConnect={onConnect} />);
    await page.getByRole('button', { name: 'Conectar carteira' }).click();
    expect(onConnect).toHaveBeenCalledWith('w-eth-1');
  });

  it('conectando: aria-busy e sem novo disparo', async () => {
    const onConnect = vi.fn();
    await renderCheckoutUi(
      <WalletNetworkPicker {...base} connection={{ status: 'connecting', networkId: null }} onConnect={onConnect} />,
    );
    const button = page.getByRole('button', { name: /Conectando/ });
    await expect.element(button).toHaveAttribute('aria-busy', 'true');
    await button.click({ force: true });
    expect(onConnect).not.toHaveBeenCalled();
  });

  it('recusada: role=alert e permite tentar de novo', async () => {
    await renderCheckoutUi(<WalletNetworkPicker {...base} connection={{ status: 'rejected', networkId: null }} />);
    await expect.element(page.getByRole('alert')).toMatchTextContent('A carteira recusou a conexão.');
    await expect.element(page.getByRole('button', { name: 'Conectar carteira' })).toBeVisible();
  });

  it('conectada: mostra status e Trocar carteira', async () => {
    const onChangeWallet = vi.fn();
    await renderCheckoutUi(
      <WalletNetworkPicker {...base} connection={{ status: 'connected', networkId: 'ethereum' }} onChangeWallet={onChangeWallet} />,
    );
    await expect.element(page.getByText('Carteira conectada')).toBeVisible();
    expect(page.getByRole('button', { name: 'Conectar carteira' }).query()).toBeNull();
    await page.getByRole('button', { name: 'Trocar carteira' }).click();
    expect(onChangeWallet).toHaveBeenCalledTimes(1);
  });

  it('sem carteira na rede: mensagem e link para /account/wallets', async () => {
    await renderCheckoutUi(<WalletNetworkPicker {...base} wallets={[]} walletId={null} />);
    await expect.element(page.getByText('Nenhuma carteira cadastrada nesta rede')).toBeVisible();
    await expect.element(page.getByRole('link', { name: 'Cadastrar carteira' })).toHaveAttribute('href', '/account/wallets');
    expect(page.getByRole('button', { name: 'Conectar carteira' }).query()).toBeNull();
  });
});

describe('WalletNetworkPicker (en)', () => {
  it('rotulos em ingles', async () => {
    await renderCheckoutUi(<WalletNetworkPicker {...base} />, 'en');
    await expect.element(page.getByRole('combobox', { name: 'Network' })).toBeVisible();
    await expect.element(page.getByRole('radio', { name: /Primary/ })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Connect wallet' })).toBeVisible();
  });
});
