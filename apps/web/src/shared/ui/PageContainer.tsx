import type { ReactNode } from 'react';

// Largura de conteudo do Figma (1200 no frame de 1440) com as margens laterais por breakpoint.
const BASE = 'mx-auto w-full max-w-[1200px] px-16 tablet:px-24 desktop:px-0';

export function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={[BASE, className].join(' ')}>
      {children}
    </div>
  );
}
