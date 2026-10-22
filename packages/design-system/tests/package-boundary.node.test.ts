import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

const FORBIDDEN_EXACT = ['@jg/web', 'axios', 'msw', 'socket.io-client'];
const FORBIDDEN_SCOPES = ['@tanstack/'];

type PackageJson = Partial<Record<(typeof DEPENDENCY_FIELDS)[number], Record<string, string>>>;

function isForbidden(name: string): boolean {
  return FORBIDDEN_EXACT.includes(name) || FORBIDDEN_SCOPES.some((scope) => name.startsWith(scope));
}

function findForbiddenDependencies(pkg: PackageJson): string[] {
  return DEPENDENCY_FIELDS.flatMap((field) =>
    Object.keys(pkg[field] ?? {})
      .filter(isForbidden)
      .map((name) => `${field}:${name}`),
  );
}

describe('fronteira do pacote design-system', () => {
  it.each(DEPENDENCY_FIELDS)('detecta @tanstack/react-query em %s', (field) => {
    const pkg: PackageJson = { [field]: { '@tanstack/react-query': '^5.0.0' } };
    expect(findForbiddenDependencies(pkg)).toEqual([`${field}:@tanstack/react-query`]);
  });

  it.each(DEPENDENCY_FIELDS)('detecta @jg/web em %s', (field) => {
    const pkg: PackageJson = { [field]: { '@jg/web': 'workspace:*' } };
    expect(findForbiddenDependencies(pkg)).toEqual([`${field}:@jg/web`]);
  });

  it.each(['axios', 'msw', 'socket.io-client'])('detecta %s proibido', (name) => {
    expect(findForbiddenDependencies({ dependencies: { [name]: '1.0.0' } })).toEqual([
      `dependencies:${name}`,
    ]);
  });

  it.each([
    'i18next',
    'react-i18next',
    'react-intl',
    'use-intl',
    'next-intl',
    'typesafe-i18n',
    '@formatjs/intl',
    '@lingui/core',
  ])('detecta %s proibido', (name) => {
    expect(findForbiddenDependencies({ dependencies: { [name]: '1.0.0' } })).toEqual([
      `dependencies:${name}`,
    ]);
  });

  it('nao acusa dependencias permitidas', () => {
    expect(findForbiddenDependencies({ dependencies: { clsx: '2.1.1' } })).toEqual([]);
  });

  it('package.json do design-system nao declara dependencias proibidas', () => {
    // JG_DS_PACKAGE_JSON permite apontar para uma copia (verificacao de mutacao) sem tocar no arquivo real.
    const path = process.env.JG_DS_PACKAGE_JSON ?? resolve(import.meta.dirname, '../package.json');
    const pkg = JSON.parse(readFileSync(path, 'utf8')) as PackageJson;
    expect(findForbiddenDependencies(pkg)).toEqual([]);
  });
});
