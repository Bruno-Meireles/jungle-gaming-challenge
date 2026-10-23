import type { ptBR } from './pt-BR';

export const en = {
  title: 'Minting Journal',
  subtitle: 'Stories, guides and insights for collectors on the world of digital ownership.',
  meta: '{{date}} | {{minutes}} min read',
  readMore: 'Read more',
  readMoreAbout: 'Read more about {{title}}',
  posts: {
    ownership: {
      title: 'How NFT ownership works',
      summary: 'Learn how to collect, trade and verify digital assets.',
    },
    artists: {
      title: '10 digital artists to follow',
      summary: 'Meet the creators shaping digital culture.',
    },
    rarity: {
      title: 'Rarity, traits and provenance',
      summary: 'Understand rarity, provenance, copyright and utility.',
    },
    security: {
      title: 'How to protect your wallet',
      summary: 'Protect your wallet, your assets and your identity.',
    },
  },
} satisfies typeof ptBR;
