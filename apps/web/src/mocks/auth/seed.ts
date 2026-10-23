import type { MockState } from '../state/state-schema';

// Contas ficticias (senhas documentadas no README; aqui so o hash).
export function seedState(): MockState {
  return {
    version: 1,
    users: [
      {
        id: 'user-ana',
        displayName: 'Ana Souza',
        username: 'ana',
        email: 'ana@example.test',
        avatarUrl: null,
        salt: 'jg-demo-ana',
        passwordHash: '4319ee158d75c2a490c12277544ec9fa7d48901556f4cb765da9343b99e84d58',
      },
      {
        id: 'user-bruno',
        displayName: 'Bruno Lima',
        username: 'bruno',
        email: 'bruno@example.test',
        avatarUrl: null,
        salt: 'jg-demo-bruno',
        passwordHash: 'ecbfc53e32a8a2c31b55f8b119b02c78fad23b5cf8cb864c4d37f4b7528a9ed8',
      },
    ],
    sessions: [],
    wallets: [
      {
        userId: 'user-ana',
        wallet: {
          id: 'wallet-ana-primary',
          kind: 'primary',
          network: 'ethereum',
          address: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f',
        },
      },
    ],
  };
}
