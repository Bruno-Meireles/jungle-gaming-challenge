import type { ComponentProps } from 'react';

export type RatingProps = Omit<ComponentProps<'div'>, 'children'> & {
  value: number;
  max: 5;
  label: string;
};

export function Rating(props: RatingProps) {
  void props;
  return null;
}
