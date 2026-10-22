import type { ReactNode } from 'react';

export type LiveRegionProps = {
  politeness?: 'polite' | 'assertive';
  children?: ReactNode;
};

export function LiveRegion({ politeness = 'polite', children }: LiveRegionProps) {
  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic="true"
    >
      {children}
    </div>
  );
}
