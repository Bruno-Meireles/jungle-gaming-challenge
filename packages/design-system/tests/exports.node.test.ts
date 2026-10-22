import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const EXPECTED_KEYS = ['.', './styles.css', './tokens.css', './fonts/*', './package.json'];

type PackageJson = { exports?: Record<string, unknown> };

function exportKeysDiff(pkg: PackageJson): { extra: string[]; missing: string[] } {
  const keys = Object.keys(pkg.exports ?? {});
  return {
    extra: keys.filter((key) => !EXPECTED_KEYS.includes(key)),
    missing: EXPECTED_KEYS.filter((key) => !keys.includes(key)),
  };
}

const appDir = resolve(import.meta.dirname, '../../../apps/web');

// Resolve num processo Node limpo, sem NODE_PATH (o `pnpm exec` injeta hoist privado que mascararia a resolucao).
function resolveFromApp(specifier: string): { path?: string; code?: string } {
  const env = { ...process.env };
  delete env.NODE_PATH;
  const script = `try { process.stdout.write(JSON.stringify({ path: require('node:module').createRequire(process.cwd() + '/package.json').resolve(${JSON.stringify(specifier)}) })) } catch (e) { process.stdout.write(JSON.stringify({ code: e.code })) }`;
  return JSON.parse(execFileSync(process.execPath, ['-e', script], { cwd: appDir, env, encoding: 'utf8' }));
}

describe('exports do design-system', () => {
  it('detecta chave extra', () => {
    const pkg = { exports: Object.fromEntries([...EXPECTED_KEYS, './primitives/*'].map((k) => [k, 'x'])) };
    expect(exportKeysDiff(pkg)).toEqual({ extra: ['./primitives/*'], missing: [] });
  });

  it('detecta chave faltando', () => {
    const pkg = { exports: Object.fromEntries(EXPECTED_KEYS.filter((k) => k !== './tokens.css').map((k) => [k, 'x'])) };
    expect(exportKeysDiff(pkg)).toEqual({ extra: [], missing: ['./tokens.css'] });
  });

  it('package.json do design-system exporta exatamente as chaves previstas', () => {
    // JG_DS_PACKAGE_JSON permite apontar para uma copia (verificacao de mutacao) sem tocar no arquivo real.
    const path = process.env.JG_DS_PACKAGE_JSON ?? resolve(import.meta.dirname, '../package.json');
    const pkg = JSON.parse(readFileSync(path, 'utf8')) as PackageJson;
    expect(exportKeysDiff(pkg)).toEqual({ extra: [], missing: [] });
  });

  it.each(['@jg/design-system/primitives/button', '@jg/design-system/src/index.ts'])(
    'subpath nao exportado %s falha com ERR_PACKAGE_PATH_NOT_EXPORTED',
    (specifier) => {
      expect(resolveFromApp(specifier)).toEqual({ code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
    },
  );

  it('@jg/design-system/package.json resolve', () => {
    const result = resolveFromApp('@jg/design-system/package.json');
    expect(result.code).toBeUndefined();
    expect(result.path).toMatch(/design-system[\\/]package\.json$/);
  });
});
