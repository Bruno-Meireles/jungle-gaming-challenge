// Gate de regressao visual: roda o Playwright local; baselines sao por plataforma via {platform}.
// Uso (a partir de packages/design-system): node ../../tools/visual.mjs [args do playwright test]
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...args], {
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
