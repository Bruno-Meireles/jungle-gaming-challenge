import { useState } from 'react';

import { connectWallet, disconnectWallet } from '../../../entities/user';
import type { NetworkId } from '../../../shared/api/contracts/ids';
import type { ConnectionView } from '../../../widgets/checkout';

export type WalletConnectionState = ConnectionView & { connectionId?: string; provider?: string };

const DISCONNECTED: WalletConnectionState = { status: 'disconnected', networkId: null };

/** Conexao simulada (API MSW): conecta, recusa e desconecta; trocar de rede ou carteira derruba a conexao. */
export function useWalletConnection() {
  const [connection, setConnection] = useState<WalletConnectionState>(DISCONNECTED);
  return {
    connection,
    connect: (walletId: string, networkId: NetworkId) => {
      setConnection({ status: 'connecting', networkId });
      connectWallet(walletId).then(
        (result) => setConnection({ status: 'connected', networkId, connectionId: result.connectionId, provider: result.provider }),
        () => setConnection({ status: 'rejected', networkId }),
      );
    },
    disconnect: () => {
      void disconnectWallet().catch(() => undefined);
      setConnection(DISCONNECTED);
    },
    reset: () => setConnection(DISCONNECTED),
  };
}
