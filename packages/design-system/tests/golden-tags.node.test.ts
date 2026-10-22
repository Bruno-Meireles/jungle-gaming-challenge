import { describe, expect, it } from 'vitest';
import { findUnknownGoldenTags, parseGoldenStories, type StorybookIndex } from '../golden/stories';

type Row = readonly [string, { id: string; type: string; tags: string[] }];

const story = (id: string, tags: string[], type = 'story'): Row => [id, { id, type, tags }];
const indexOf = (...entries: Row[]): StorybookIndex => ({ entries: Object.fromEntries(entries) });

describe('parseGoldenStories', () => {
  it.each([
    ['golden', 'static'],
    ['golden-hover', 'hover'],
    ['golden-focus', 'focus'],
    ['golden-page', 'page'],
  ] as const)('tag %s gera a entrada %s', (tag, kind) => {
    const result = parseGoldenStories(indexOf(story('a--b', ['autodocs', tag])));
    expect(result).toEqual([{ id: 'a--b', kinds: [kind] }]);
  });

  it('ignora story sem tag golden', () => {
    expect(parseGoldenStories(indexOf(story('a--b', ['autodocs'])))).toEqual([]);
  });

  it('ignora entradas docs mesmo com tag golden', () => {
    expect(parseGoldenStories(indexOf(story('a--docs', ['golden'], 'docs')))).toEqual([]);
  });

  it('story com duas tags gera uma entrada com os dois kinds', () => {
    const result = parseGoldenStories(indexOf(story('a--b', ['golden', 'golden-hover'])));
    expect(result).toEqual([{ id: 'a--b', kinds: ['static', 'hover'] }]);
  });
});

describe('findUnknownGoldenTags', () => {
  it('lista tags golden-* desconhecidas com o id da story', () => {
    const index = indexOf(story('a--b', ['golden-hovr']), story('c--d', ['golden', 'golden-page']));
    expect(findUnknownGoldenTags(index)).toEqual(['a--b: golden-hovr']);
  });

  it('retorna vazio quando todas as tags são conhecidas', () => {
    expect(findUnknownGoldenTags(indexOf(story('a--b', ['golden', 'golden-focus'])))).toEqual([]);
  });
});
