/** Porta do recibo (ADR-25): snapshot congelado do pedido, sem depender de entities/order. Somente tipos. */

export type ReceiptItem = {
  tokenId: string;
  title: string;
  quantity: number;
  unitPriceEth: string;
  lineTotalEth: string;
};

export type ReceiptSnapshot = {
  id: string;
  status: 'pending' | 'confirmed' | 'refused';
  /** ISO 8601 UTC. */
  createdAt: string;
  networkId: 'ethereum' | 'polygon';
  walletAddress: string;
  transactionRef: string | null;
  items: ReceiptItem[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
};

export type ReceiptView = {
  id: string;
  transactionRef: string | null;
  date: string;
  wallet: string;
  explorerUrl: string | null;
  items: { key: string; title: string; editions: number; totalLabel: string }[];
  networkFee: string;
  /** null quando o desconto e zero. */
  discount: string | null;
  total: string;
};

export type ReceiptState =
  | { kind: 'loading' }
  | { kind: 'not_found' }
  | { kind: 'error' }
  | { kind: 'pending' | 'confirmed' | 'refused'; order: ReceiptSnapshot };
