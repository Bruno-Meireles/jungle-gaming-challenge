import { readScenario, type ScenarioId } from '../scenario';

/** Cenario ativo; seguro fora do navegador (testes node sem localStorage). */
export function activeScenario(): ScenarioId {
  try {
    return readScenario(typeof localStorage === 'undefined' ? { getItem: () => null } : localStorage);
  } catch {
    return 'default';
  }
}
