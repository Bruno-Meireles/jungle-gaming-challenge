export const orderKeys = {
  all: ['orders'] as const,
  detail: (orderId: string) => ['orders', 'detail', { orderId }] as const,
};
