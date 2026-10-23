import type { LocalizedText } from './nft-detail';

export function pickLocalized(text: LocalizedText, language: string): string {
  const [preferred, other] = language.toLowerCase().startsWith('pt')
    ? (['pt-BR', 'en'] as const)
    : (['en', 'pt-BR'] as const);
  return text[preferred] || text[other];
}
