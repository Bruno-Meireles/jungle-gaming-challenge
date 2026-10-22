// Roda os golden tests (Playwright) em Linux, a plataforma das baselines versionadas (ADR-10).
// Uso (a partir de packages/design-system): node ../../tools/visual-docker.mjs [args do playwright test]
//
// - Monta o repo inteiro em /work (storybook-static e golden/__screenshots__ ficam no host).
// - O node_modules do host (Windows) não serve no Linux: o volume Docker nomeado
//   jg-ds-pw-node-modules cobre packages/design-system/node_modules e recebe apenas
//   @playwright/test@1.64.1 (npm, só na primeira execução).
// - Pré-requisito: `pnpm --filter @jg/design-system storybook:build` já executado no host.
// - Para recriar o volume: docker volume rm jg-ds-pw-node-modules
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const PW_VERSION = '1.64.1';
const repo = resolve(import.meta.dirname, '..');

// Argumentos extras chegam ao container como "$@" (sem interpolação em shell).
const inner = [
  'set -e',
  'if [ ! -d node_modules/@playwright/test ]; then',
  '  mkdir -p /tmp/pw && cd /tmp/pw && npm init -y >/dev/null',
  `  npm install --no-audit --no-fund @playwright/test@${PW_VERSION}`,
  '  cd /work/packages/design-system && cp -r /tmp/pw/node_modules/. node_modules/',
  'fi',
  'exec node node_modules/@playwright/test/cli.js test "$@"',
].join('\n');

const args = [
  'run', '--rm', '--ipc=host',
  '-v', `${repo}:/work`,
  '-v', 'jg-ds-pw-node-modules:/work/packages/design-system/node_modules',
  '-w', '/work/packages/design-system',
  '-e', 'CI=1',
  `mcr.microsoft.com/playwright:v${PW_VERSION}-noble`,
  'bash', '-c', inner, 'bash', ...process.argv.slice(2),
];
const result = spawnSync('docker', args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
