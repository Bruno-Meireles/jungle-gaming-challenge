export const SCENARIO_STORAGE_KEY = 'jg:mocks:scenario';

export const SCENARIO_IDS = [
  'default',
  'catalog-empty',
  'catalog-error',
  'catalog-flaky',
  'catalog-slow',
  'catalog-out-of-order',
] as const;

export type ScenarioId = (typeof SCENARIO_IDS)[number];

const SCENARIO_SET: ReadonlySet<string> = new Set(SCENARIO_IDS);

function isScenarioId(value: string | null): value is ScenarioId {
  return value !== null && SCENARIO_SET.has(value);
}

export function readScenario(storage: Pick<Storage, 'getItem'>): ScenarioId {
  const value = storage.getItem(SCENARIO_STORAGE_KEY);
  return isScenarioId(value) ? value : 'default';
}
