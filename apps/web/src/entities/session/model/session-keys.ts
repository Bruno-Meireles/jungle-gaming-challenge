export const sessionKeys = {
  all: ['session'] as const,
  current: () => ['session', 'current'] as const,
};
