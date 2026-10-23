import { asEthAmount } from '../../../shared/lib/eth/eth';
import { formatEthAmount } from '../../../shared/lib/eth/format-eth';
import { shortenAddress } from '../../../shared/lib/wallet/shorten-address';
import type { ReceiptSnapshot, ReceiptView } from './ports';

type Locale = 'pt-BR' | 'en';

const EXPLORERS: Record<ReceiptSnapshot['networkId'], string> = {
  ethereum: 'https://etherscan.io/tx/',
  polygon: 'https://polygonscan.com/tx/',
  solana: 'https://solscan.io/tx/',
};

const eth = (value: string, locale: Locale) => `${formatEthAmount(asEthAmount(value), locale)} ETH`;

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(iso));
}

export function toReceiptView(order: ReceiptSnapshot, locale: Locale): ReceiptView {
  const ref = order.transactionRef;
  return {
    id: order.id,
    transactionRef: ref,
    date: formatDate(order.createdAt, locale),
    wallet: shortenAddress(order.walletAddress),
    explorerUrl: ref === null ? null : `${EXPLORERS[order.networkId]}${encodeURIComponent(ref)}`,
    items: order.items.map((item) => ({
      key: item.tokenId,
      title: item.title,
      editions: item.quantity,
      totalLabel: eth(item.lineTotalEth, locale),
    })),
    networkFee: eth(order.networkFeeEth, locale),
    discount: asEthAmount(order.discountEth) === '0' ? null : eth(order.discountEth, locale),
    total: eth(order.totalEth, locale),
  };
}
