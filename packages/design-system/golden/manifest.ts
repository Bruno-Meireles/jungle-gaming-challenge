export type GoldenKind = 'static' | 'hover' | 'focus' | 'page';

export interface GoldenEntry {
  id: string;
  kind: GoldenKind;
}

export const goldenManifest: readonly GoldenEntry[] = [
  { id: 'primitives-separator--horizontal', kind: 'static' },
];
