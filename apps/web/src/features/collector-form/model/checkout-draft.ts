import type { CollectorValues } from './collector-schema';

export type CheckoutDraft = { values: CollectorValues; walletId: string | null; networkId: string };

export type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const PREFIX = 'jg.checkout.draft.';

function isDraft(value: unknown): value is CheckoutDraft {
  if (typeof value !== 'object' || value === null) return false;
  return 'values' in value && 'networkId' in value && 'walletId' in value;
}

export function createDraftStore(storage: DraftStorage) {
  const keyOf = (userId: string) => `${PREFIX}${userId}`;
  return {
    save(userId: string, draft: CheckoutDraft): void {
      storage.setItem(keyOf(userId), JSON.stringify(draft));
    },
    load(userId: string): CheckoutDraft | null {
      const raw = storage.getItem(keyOf(userId));
      if (raw === null) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        return isDraft(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    clear(userId: string): void {
      storage.removeItem(keyOf(userId));
    },
  };
}
