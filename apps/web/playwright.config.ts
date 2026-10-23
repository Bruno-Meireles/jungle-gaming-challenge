import { defineConfig, devices } from '@playwright/test';

// PORT e PW_OUTPUT permitem rodar várias cópias (worktrees) em paralelo sem colisão.
const PORT = Number(process.env.PORT ?? 5173);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  outputDir: process.env.PW_OUTPUT ?? 'test-results',
  forbidOnly: true,
  // Baselines versionadas por plataforma/projeto em e2e/<spec>-snapshots; dados dos mocks sao deterministicos.
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: BASE_URL,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'desktop-1440',
      grepInvert: /@tablet/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet-768',
      grep: /@tablet/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'mobile-390',
      grepInvert: /@tablet/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `pnpm exec vite --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    env: { VITE_ENABLE_MOCKS: 'true' },
    reuseExistingServer: !process.env.CI,
  },
});
