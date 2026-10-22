import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const runtimeDeps = ['clsx', 'tailwind-merge', 'class-variance-authority', 'axe-core'];
const radixDeps = [
  '@radix-ui/react-avatar',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-dialog',
  '@radix-ui/react-label',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-slider',
  '@radix-ui/react-slot',
  '@radix-ui/react-tabs',
];

export default defineConfig({
  test: {
    projects: [
      {
        test: { name: 'node', include: ['tests/**/*.node.test.ts'], environment: 'node', testTimeout: 30000 },
      },
      {
        plugins: [tailwindcss()],
        optimizeDeps: { include: ['react/jsx-dev-runtime', 'vitest-browser-react', ...radixDeps, ...runtimeDeps] },
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.stories.{ts,tsx}'],
          setupFiles: ['src/test/setup.ts'],
          testTimeout: 30_000, // cold start em checkout limpo roda 3 Chromium em paralelo
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
      {
        plugins: [tailwindcss(), storybookTest({ configDir: '.storybook' })],
        optimizeDeps: { include: ['react/jsx-dev-runtime', ...radixDeps, ...runtimeDeps] },
        test: {
          name: 'storybook',
          testTimeout: 30_000,
          browser: {
            enabled: true,
            connectTimeout: 180_000,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
