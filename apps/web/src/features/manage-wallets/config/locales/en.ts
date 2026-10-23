import type { ptBR } from './pt-BR';

export const en = {
  primary: { title: 'Primary wallet', empty: "You haven't added a primary wallet yet." },
  secondary: { title: 'Secondary wallet', empty: "You haven't added a secondary wallet yet." },
  fields: { network: 'Network', address: 'Wallet address', same: 'Same as primary wallet' },
  networks: { ethereum: 'Ethereum', polygon: 'Polygon', solana: 'Solana' },
  actions: { save: 'Save', add: 'Add', retry: 'Try again' },
  messages: {
    saved: 'Wallet saved',
    loadFailed: 'Could not load the wallets.',
    network: 'Could not connect. Check your connection.',
    unexpected: 'Something went wrong. Please try again later.',
  },
  errors: {
    required: 'This field is required',
    invalid_address: 'Invalid wallet address',
  },
} satisfies typeof ptBR;
