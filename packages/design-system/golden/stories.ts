export type GoldenKind = 'static' | 'hover' | 'focus' | 'page';

export interface GoldenEntry {
  id: string;
  kinds: GoldenKind[];
}

export interface StorybookIndex {
  entries: Record<string, { id: string; type: string; tags?: string[] }>;
}

const KIND_BY_TAG: Record<string, GoldenKind> = {
  golden: 'static',
  'golden-hover': 'hover',
  'golden-focus': 'focus',
  'golden-page': 'page',
};

const stories = (index: StorybookIndex) =>
  Object.values(index.entries).filter((entry) => entry.type === 'story');

export function parseGoldenStories(index: StorybookIndex): GoldenEntry[] {
  const result: GoldenEntry[] = [];
  for (const { id, tags = [] } of stories(index)) {
    const kinds = tags.flatMap((tag) => (tag in KIND_BY_TAG ? [KIND_BY_TAG[tag]!] : []));
    if (kinds.length > 0) result.push({ id, kinds });
  }
  return result;
}

export function findUnknownGoldenTags(index: StorybookIndex): string[] {
  return stories(index).flatMap(({ id, tags = [] }) =>
    tags
      .filter((tag) => tag.startsWith('golden') && !(tag in KIND_BY_TAG))
      .map((tag) => `${id}: ${tag}`),
  );
}
