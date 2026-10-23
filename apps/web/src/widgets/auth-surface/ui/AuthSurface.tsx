import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@jg/design-system';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '../../../shared/hooks';

export type AuthSurfaceProps = {
  title: string;
  subtitle: string;
  onDismiss: () => void;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthSurface({ title, subtitle, onDismiss, footer, children }: AuthSurfaceProps) {
  const { t } = useTranslation('authSurface');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(open) => (open ? undefined : onDismiss())}>
        <DialogContent className="flex flex-col gap-24">
          <DialogClose closeLabel={t('close')} />
          <div className="flex flex-col gap-8">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{subtitle}</DialogDescription>
          </div>
          {children}
          <div className="text-body-14-regular-lh-16">{footer}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <section className="flex flex-col gap-24 p-16">
      <p aria-hidden="true" className="mt-32 text-center text-display-32-bold text-foreground">
        {t('brand')}
      </p>
      <div className="mt-24 flex flex-col gap-8 text-center">
        <h1 className="text-title-20-bold-lh-16 text-foreground">{title}</h1>
        <p className="sr-only">{subtitle}</p>
      </div>
      {children}
      <div className="text-center text-body-15-regular-lh-16 text-text-secondary">{footer}</div>
    </section>
  );
}
