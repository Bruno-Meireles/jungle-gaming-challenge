import type { ReactNode } from 'react';
import type { Resources } from '../i18n/resources';

export function AppProviders({ children }: { children: ReactNode; resources?: Resources }) {
  return <>{children}</>;
}
