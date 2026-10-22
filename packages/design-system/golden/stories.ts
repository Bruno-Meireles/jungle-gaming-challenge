export type GoldenKind = 'static' | 'hover' | 'focus' | 'page';

export interface GoldenEntry {
  id: string;
  kinds: GoldenKind[];
}

export interface StorybookIndex {
  entries: Record<string, { id: string; type: string; tags?: string[] }>;
}

export function parseGoldenStories(index: StorybookIndex): GoldenEntry[] {
  void index;
  return [];
}

export function findUnknownGoldenTags(index: StorybookIndex): string[] {
  void index;
  return ['skeleton'];
}
