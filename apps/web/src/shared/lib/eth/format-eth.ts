import type { EthAmount } from './eth';

type EthLocale = 'pt-BR' | 'en';

const SEPARATORS: Record<EthLocale, { group: string; decimal: string }> = {
  'pt-BR': { group: '.', decimal: ',' },
  en: { group: ',', decimal: '.' },
};

function groupThousands(integer: string, separator: string): string {
  return integer.replace(/\B(?=(\d{3})+$)/g, separator);
}

export function formatEthAmount(value: EthAmount, locale: EthLocale): string {
  const { group, decimal } = SEPARATORS[locale];
  const [integer = '0', fraction] = value.split('.');
  const grouped = groupThousands(integer, group);
  return fraction === undefined ? grouped : `${grouped}${decimal}${fraction}`;
}
