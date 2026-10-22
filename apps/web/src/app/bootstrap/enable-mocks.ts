import { onlineManager } from '@tanstack/react-query';

/*
 * Liga o worker MSW (VITE_ENABLE_MOCKS=true). A UI renderiza de imediato (o shell nao espera o worker);
 * enquanto o worker nao esta ativo, o TanStack Query mantem as buscas pausadas (onlineManager) e as libera
 * quando ele esta pronto, para nenhuma requisicao escapar dos handlers.
 */
export async function enableMocks(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') return;
  onlineManager.setOnline(false);
  try {
    const { worker } = await import('../../mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  } finally {
    onlineManager.setOnline(true);
  }
}
