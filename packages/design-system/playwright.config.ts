import { defineConfig } from '@playwright/test';

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
];

export default defineConfig({
  testDir: 'golden',
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}',
  updateSnapshots: 'none',
  forbidOnly: true,
  reporter: [['html', { open: 'never' }], ['list']],
  expect: {
    timeout: 20_000, // o Storybook pode renderizar devagar sob carga; nao afeta a tolerancia da captura
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      threshold: 0.02,
      maxDiffPixelRatio: 0.0005,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:6007',
    reducedMotion: 'reduce',
    colorScheme: 'dark',
    trace: 'retain-on-failure',
  },
  projects: viewports.map(({ name, width, height }) => ({
    name,
    use: { browserName: 'chromium', viewport: { width, height } },
  })),
  webServer: {
    command: 'node ../../tools/serve-static.mjs storybook-static 6007',
    url: 'http://127.0.0.1:6007/index.json',
    reuseExistingServer: !process.env.CI,
  },
});
