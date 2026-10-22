import type { ReactElement, ReactNode } from 'react';

export type NftCardProps = {
  title: string;
  priceLabel: string;
  image: { src: string; alt: string };
  badge?: ReactNode;
  action?: ReactNode;
  link?: ReactElement;
};

export function NftCard(props: NftCardProps) {
  void props;
  return null;
}
