export type JournalPostId = 'ownership' | 'artists' | 'rarity' | 'security';

export type JournalPost = { id: JournalPostId; publishedAt: string; minutes: number; image: string };

// Conteudo editorial fixo da demonstracao (datas do Figma; imagens do mock, desvio ADR-22).
export const JOURNAL_POSTS: readonly JournalPost[] = [
  { id: 'ownership', publishedAt: '2026-09-12', minutes: 6, image: '/nfts/cosmic-bloom-118-480.webp' },
  { id: 'artists', publishedAt: '2026-09-13', minutes: 2, image: '/nfts/violet-nomad-314-480.webp' },
  { id: 'rarity', publishedAt: '2026-09-15', minutes: 3, image: '/nfts/ivory-baron-088-480.webp' },
  { id: 'security', publishedAt: '2026-09-15', minutes: 2, image: '/nfts/golden-beat-207-480.webp' },
];
