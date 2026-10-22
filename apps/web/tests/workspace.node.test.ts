import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Resolve num processo Node limpo, sem NODE_PATH: o `pnpm exec` injeta
// node_modules/.pnpm/node_modules (hoist privado), o que mascararia a ausência
// da dependência declarada em @jg/web.
function resolveFromApp(specifier: string): string {
  const env = { ...process.env };
  delete env.NODE_PATH;
  const script = `process.stdout.write(require('node:module').createRequire(process.cwd() + '/package.json').resolve(${JSON.stringify(specifier)}))`;
  return execFileSync(process.execPath, ['-e', script], { cwd: appDir, env, encoding: 'utf8' });
}

describe('workspace', () => {
  it('@jg/web resolve @jg/design-system/package.json para packages/design-system (realpath)', () => {
    const resolved = realpathSync(resolveFromApp('@jg/design-system/package.json'));

    const expected = realpathSync(resolve(appDir, '../../packages/design-system/package.json'));
    expect(resolved).toBe(expected);
  });
});
