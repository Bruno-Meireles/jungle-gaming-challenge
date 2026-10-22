/*
 * Placeholder de carregamento do NftCard (derivado, ADR-12: o Figma nao tem frame de skeleton). Mesma caixa do card:
 * midia 200 (mobile) / 300 (>= tablet), texto 36 / 38, gap 8 / 12, para nao causar CLS.
 */
import { cn } from '../../lib/cn';
import { Skeleton } from '../../primitives/skeleton';

export type NftCardSkeletonProps = React.ComponentProps<'div'>;

export function NftCardSkeleton({ className, ...props }: NftCardSkeletonProps) {
  return (
    <div
      data-slot="nft-card-skeleton"
      aria-hidden="true"
      className={cn('flex w-full flex-col gap-8 tablet:gap-12', className)}
      {...props}
    >
      <Skeleton className="h-200 w-full rounded-20 tablet:h-300 tablet:rounded-0" />
      <div className="flex flex-col pl-8 tablet:gap-6 tablet:pl-0">
        <Skeleton className="h-20 w-3/4 tablet:h-16" />
        <Skeleton className="h-16 w-1/3" />
      </div>
    </div>
  );
}
