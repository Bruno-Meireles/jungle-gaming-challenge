import type { ptBR } from './pt-BR';

export const en = {
  networks: { ethereum: 'Ethereum', polygon: 'Polygon', solana: 'Solana' },
  network: 'Network',
  wallets: 'Wallets',
  kind: { primary: 'Primary', secondary: 'Backup' },
  connect: 'Connect wallet',
  connecting: 'Connecting…',
  rejected: 'The wallet rejected the connection.',
  toneLabel: 'Error',
  connected: 'Wallet connected',
  change: 'Change wallet',
  empty: 'No wallet registered on this network',
  register: 'Register wallet',
} satisfies typeof ptBR;
