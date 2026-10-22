import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: { name: 'node', include: ['tests/**/*.node.test.ts', 'src/**/*.node.test.ts'], environment: 'node', testTimeout: 30000 },
      },
      {
        plugins: [tailwindcss()],
        optimizeDeps: { include: ['react/jsx-dev-runtime', 'vitest-browser-react'] },
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            connectTimeout: 180_000,
            headless: true,
            provider: playwright(),
            viewport: { width: 1440, height: 900 },
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
