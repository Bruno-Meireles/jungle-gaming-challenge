import { describe, expect, it } from 'vitest';

import { findParityIssues } from '../../shared/lib/i18n/locale-parity';

import { resources } from './resources';

describe('findParityIssues', () => {
  it('devolve [] quando os dois lados sao iguais', () => {
    const base = { a: 'x {{n}}', b: { c: 'y' } };
    expect(findParityIssues(base, { a: 'x {{n}}', b: { c: 'y' } })).toEqual([]);
  });

  it('aponta chave ausente em other', () => {
    expect(findParityIssues({ a: 'x', b: 'y' }, { a: 'x' })).toEqual(['b: ausente em other']);
  });

  it('aponta chave que sobra em other', () => {
    expect(findParityIssues({ a: 'x' }, { a: 'x', b: 'y' })).toEqual(['b: sobra em other']);
  });

  it('aponta placeholder faltando em other', () => {
    expect(findParityIssues({ a: 'oi {{a}} {{b}}' }, { a: 'hi {{a}}' })).toEqual([
      'a: placeholders diferentes: base [a,b] other [a]',
    ]);
  });

  it('aponta placeholder extra em other', () => {
    expect(findParityIssues({ a: 'oi {{a}}' }, { a: 'hi {{a}} {{b}}' })).toEqual([
      'a: placeholders diferentes: base [a] other [a,b]',
    ]);
  });

  it('compara objetos aninhados com caminho pontuado e ordem estavel', () => {
    expect(
      findParityIssues({ z: { k: 'x' }, a: { b: { c: 'x' } } }, { z: {}, a: { b: {} } }),
    ).toEqual(['a.b.c: ausente em other', 'z.k: ausente em other']);
  });

  it('conta tipos divergentes como problema', () => {
    const issues = findParityIssues({ a: 'x', b: { c: 'y' } }, { a: { c: 'x' }, b: 'y' });
    expect(issues).toHaveLength(2);
    expect(issues[0]).toMatch(/^a: /);
    expect(issues[1]).toMatch(/^b: /);
  });
});

describe('paridade dos recursos de traducao', () => {
  it('pt-BR e en tem o mesmo conjunto de namespaces', () => {
    expect(Object.keys(resources.en).sort()).toEqual(Object.keys(resources['pt-BR']).sort());
  });

  const enByNamespace = new Map(Object.entries(resources.en));

  it.each(Object.entries(resources['pt-BR']))(
    'namespace %s tem as mesmas chaves e placeholders nos dois idiomas',
    (namespace, ptBRMessages) => {
      expect(findParityIssues(ptBRMessages, enByNamespace.get(namespace) ?? {})).toEqual([]);
    },
  );
});
