// Roda o Playwright contra o build otimizado (`vite preview`), multiplataforma e sem dependencias extras.
// Uso (a partir de apps/web, depois de `pnpm build`): node ../../tools/e2e-preview.mjs [args do playwright]
import { spawn } from 'node:child_process';

const child = spawn('pnpm', ['exec', 'playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, E2E_PREVIEW: '1' },
});
child.on('exit', (code) => process.exit(code ?? 1));
