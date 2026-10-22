// Gate de regressao visual: no Linux roda o Playwright direto; nos demais SO delega ao Docker (baselines so valem em Linux, ADR-07).
// Uso (a partir de packages/design-system): node ../../tools/visual.mjs [args do playwright test]
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const native = process.platform === 'linux';
const [cmd, cmdArgs] = native
  ? [process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...args]]
  : [process.execPath, [resolve(import.meta.dirname, 'visual-docker.mjs'), ...args]];
const result = spawnSync(cmd, cmdArgs, { stdio: 'inherit' });
process.exit(result.status ?? 1);
