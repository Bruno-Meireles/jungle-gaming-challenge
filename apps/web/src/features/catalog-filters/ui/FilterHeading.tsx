import type { ReactNode } from 'react';

export function FilterHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="m-0 text-body-large-18-bold-lh-16 text-foreground">
      {children}
    </h3>
  );
}
