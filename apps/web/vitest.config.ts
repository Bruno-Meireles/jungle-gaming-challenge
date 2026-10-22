import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: { name: 'node', include: ['tests/**/*.node.test.ts'], environment: 'node' },
      },
    ],
  },
});
