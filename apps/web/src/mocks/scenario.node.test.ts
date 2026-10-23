import { describe, expect, it } from 'vitest';

import { readScenario, SCENARIO_IDS, SCENARIO_STORAGE_KEY } from './scenario';

/*
 * Assinatura sob teste:
 *   readScenario(storage: Pick<Storage, 'getItem'>): ScenarioId
 *   SCENARIO_STORAGE_KEY = 'jg:mocks:scenario'
 *   SCENARIO_IDS = ['default','catalog-empty','catalog-error','catalog-flaky','catalog-slow','catalog-out-of-order']
 */

function storageWith(value: string | null): Pick<Storage, 'getItem'> {
  return { getItem: (key) => (key === SCENARIO_STORAGE_KEY ? value : null) };
}

describe('readScenario', () => {
  it('le o cenario da chave jg:mocks:scenario', () => {
    expect(SCENARIO_STORAGE_KEY).toBe('jg:mocks:scenario');
  });

  it.each([
    'default',
    'catalog-empty',
    'catalog-error',
    'catalog-flaky',
    'catalog-slow',
    'catalog-out-of-order',
    'auth_network_error',
    'auth_server_error',
  ])('aceita o cenario da whitelist %s', (id) => {
    expect(SCENARIO_IDS).toContain(id);
    expect(readScenario(storageWith(id))).toBe(id);
  });

  it('expoe os cenarios do catalogo e os dois cenarios de auth', () => {
    expect([...SCENARIO_IDS].sort()).toEqual(
      [
        'auth_network_error',
        'auth_server_error',
        'catalog-empty',
        'catalog-error',
        'catalog-flaky',
        'catalog-out-of-order',
        'catalog-slow',
        'default',
      ],
    );
  });

  it('inclui cenarios deterministas de falha de rede e servidor para auth', () => {
    expect(SCENARIO_IDS).toContain('auth_network_error');
    expect(SCENARIO_IDS).toContain('auth_server_error');
  });

  it.each(['', 'unknown', 'DEFAULT', 'catalog-empty ', '__proto__', 'constructor'])(
    'valor desconhecido %j vira default',
    (value) => {
      expect(readScenario(storageWith(value))).toBe('default');
    },
  );

  it('chave ausente vira default', () => {
    expect(readScenario(storageWith(null))).toBe('default');
  });
});
