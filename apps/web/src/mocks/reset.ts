import { clearState } from './state';

/** Restaura integralmente o cenario conhecido (seed). */
export function resetMockState(): void {
  clearState();
}
