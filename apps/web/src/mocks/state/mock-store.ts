import { seedState } from '../auth/seed';
import { MOCK_STATE_KEY, mockStateSchema, type MockState } from './state-schema';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

let fallback: MockState | null = null;

function storage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function readState(): MockState {
  const store = storage();
  if (!store) return (fallback ??= seedState());
  const raw = store.getItem(MOCK_STATE_KEY);
  if (raw) {
    try {
      const parsed = mockStateSchema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    } catch {
      // JSON corrompido: cai no estado conhecido.
    }
  }
  return seedState();
}

export function writeState(state: MockState): void {
  const store = storage();
  if (!store) {
    fallback = state;
    return;
  }
  store.setItem(MOCK_STATE_KEY, JSON.stringify(state));
}

export function updateState<T>(mutate: (draft: MockState) => T): T {
  const draft = readState();
  const result = mutate(draft);
  writeState(draft);
  return result;
}

export function clearState(): void {
  fallback = null;
  storage()?.removeItem(MOCK_STATE_KEY);
}
