import { SCENARIO_IDS, SCENARIO_STORAGE_KEY } from '../../mocks/scenario';

/**
 * Controles de demonstracao via URL (so com mocks ativos): `?mockReset=1` restaura o seed conhecido e
 * `?mockScenario=<id>` (ou `default`) escolhe o cenario. Os parametros sao removidos da barra de enderecos.
 */
export async function applyMockControls(search: string, storage: Storage = localStorage): Promise<void> {
  const params = new URLSearchParams(search);
  const scenario = params.get('mockScenario');
  if (params.get('mockReset') !== '1' && scenario === null) return;
  if (params.get('mockReset') === '1') {
    const { resetMockState } = await import('../../mocks/reset');
    resetMockState();
    storage.removeItem(SCENARIO_STORAGE_KEY);
  }
  const chosen = SCENARIO_IDS.find((id) => id === scenario);
  if (chosen) storage.setItem(SCENARIO_STORAGE_KEY, chosen);
  params.delete('mockReset');
  params.delete('mockScenario');
  const rest = params.toString();
  history.replaceState(null, '', `${location.pathname}${rest ? `?${rest}` : ''}${location.hash}`);
}
