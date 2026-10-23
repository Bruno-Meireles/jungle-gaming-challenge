export const GUEST_ID_STORAGE_KEY = 'jg.guest.cart-id';

let memoryId: string | null = null;

/** Id estavel do visitante (carrinho anonimo persistido no servidor simulado). */
export function getGuestId(): string {
  try {
    const stored = localStorage.getItem(GUEST_ID_STORAGE_KEY);
    if (stored) return stored;
    const created = `guest-${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_ID_STORAGE_KEY, created);
    return created;
  } catch {
    memoryId ??= `guest-${crypto.randomUUID()}`;
    return memoryId;
  }
}
