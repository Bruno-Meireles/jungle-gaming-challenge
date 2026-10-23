export type AddToCartInput = { nftId: string; editionId: string; quantity: number };

export type AddToCartFailure = { kind: 'conflict' } | { kind: 'network'; retryable: true };

/** Porta da UI: quem compoe a pagina injeta a mutation (use case) que cumpre este contrato. */
export type AddToCartController = {
  submit: (input: AddToCartInput) => void;
  pending: boolean;
  failure: AddToCartFailure | null;
  retry: () => void;
};
