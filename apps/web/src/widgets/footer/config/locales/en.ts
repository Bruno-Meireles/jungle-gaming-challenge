import type { ptBR } from './pt-BR';

export const en = {
  label: 'Site footer',
  pillars: {
    wallet: { title: 'Wallet security', body: 'Protect your wallet and collect verified digital art with confidence.' },
    creators: { title: 'Featured creators', body: 'Meet the artists, studios and communities shaping digital culture on the network.' },
    alerts: { title: 'Drop alerts', body: 'Get minting calendars, allowlist news and market analysis.' },
  },
  newsletter: {
    title: 'Get ahead of the next drop',
    body: 'Get curated drops, creator stories and market news.',
    label: 'Email to receive news',
    placeholder: 'enter your email...',
    submit: 'Send',
    required: 'Enter your email.',
    invalid: 'Enter a valid email.',
    unavailable: 'Newsletter sign-up is not available in this demo yet.',
  },
  brand: 'KURIO',
  tagline: 'Built for collectors, creators and culture',
  email: 'contato@email.com',
  phone: '+55 11 4002 8922',
  phoneDigits: '+551140028922',
  columns: {
    account: {
      title: 'My profile',
      profile: 'My profile',
      collection: 'My collection',
      activity: 'Activity',
      studio: 'Creator studio',
      watchlist: 'Watchlist',
    },
    help: {
      title: 'Help center',
      buying: 'How to buy NFTs',
      security: 'Wallet and security',
      policy: 'Marketplace policy',
      report: 'Report item',
    },
    collections: {
      title: 'Collections',
      'digital-art': 'Digital art',
      photography: 'Photography',
      music: 'Music',
      '3d-art': '3D art',
      utility: 'Utility',
    },
    social: {
      title: 'Social media',
      instagram: 'Instagram',
      x: 'X',
      discord: 'Discord',
      youtube: 'YouTube',
    },
  },
  wallets: { title: 'Supported wallets', brands: 'METAMASK • WALLETCONNECT • COINBASE' },
  copyright: '© 2026 Kurio. Digital ownership for everyone.',
} satisfies typeof ptBR;
