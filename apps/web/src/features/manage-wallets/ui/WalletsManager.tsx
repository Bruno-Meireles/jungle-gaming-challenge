import { Alert, Button, LiveRegion, Skeleton } from '@jg/design-system';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { WalletKind } from '../../../shared/api/contracts/account';
import { useWalletsQuery } from '../model/use-wallets-query';
import { toSlots } from '../model/wallet-slots';
import { WalletForm } from './WalletForm';

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-16 desktop:gap-24">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between gap-16">
          <h2 id={headingId} className="text-body-large-17-bold text-foreground">
            {title}
          </h2>
          {action}
        </div>
        {description ? <p className="text-body-14-regular-lh-15 text-text-secondary">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function WalletsManager() {
  const { t } = useTranslation('manageWallets');
  const query = useWalletsQuery();
  const navigate = useNavigate();
  const href = useRouterState({ select: (state) => state.location.href });
  const [adding, setAdding] = useState<Record<WalletKind, boolean>>({ primary: false, secondary: false });
  const [saved, setSaved] = useState(false);

  if (query.isPending) {
    return (
      <div aria-busy="true" className="flex flex-col gap-24">
        <Skeleton className="h-40 max-w-417 rounded-3" />
        <Skeleton className="h-40 max-w-417 rounded-3" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="flex flex-col items-start gap-16">
        <Alert tone="error" toneLabel="">
          {t('messages.loadFailed')}
        </Alert>
        <Button variant="outline" onClick={() => void query.refetch()}>
          {t('actions.retry')}
        </Button>
      </div>
    );
  }

  const slots = toSlots(query.data);
  const onSessionExpired = () => void navigate({ to: '/login', search: { redirect: href } });
  const renderSlot = (kind: WalletKind) => {
    const wallet = slots[kind];
    if (wallet || adding[kind]) {
      return {
        action: null,
        body: (
          <WalletForm
            key={wallet?.id ?? kind}
            kind={kind}
            wallet={wallet}
            primary={slots.primary}
            showSameAsPrimary={kind === 'secondary'}
            autoFocusNetwork={!wallet}
            onSaved={() => setSaved(true)}
            onSessionExpired={onSessionExpired}
          />
        ),
      };
    }
    return {
      action: (
        <Button variant="ghost" onClick={() => setAdding({ ...adding, [kind]: true })} className="h-auto cursor-pointer">
          {t('actions.add')}
        </Button>
      ),
      body: <p className="text-body-15-regular-lh-16 text-secondary">{t(`${kind}.empty`)}</p>,
    };
  };
  const primary = renderSlot('primary');
  const secondary = renderSlot('secondary');

  return (
    <div className="flex flex-col gap-32">
      <Section title={t('primary.title')} description={t('primary.description')} action={primary.action}>
        {primary.body}
      </Section>
      <Section title={t('secondary.title')} action={secondary.action}>
        {secondary.body}
      </Section>
      <LiveRegion>{saved ? t('messages.saved') : null}</LiveRegion>
    </div>
  );
}
