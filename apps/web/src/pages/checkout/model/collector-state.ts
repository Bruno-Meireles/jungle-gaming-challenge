import { useEffect, useRef, useState } from 'react';

import {
  createDraftStore,
  validateCollector,
  type CheckoutDraft,
  type CollectorErrors,
  type CollectorField,
  type CollectorFormProps,
  type CollectorValues,
} from '../../../features/collector-form';
import type { SessionUser } from '../../../shared/api/contracts/auth';
import { NETWORK_IDS, type NetworkId } from '../../../shared/api/contracts/ids';

const EMPTY: CollectorValues = {
  displayName: '',
  email: '',
  username: '',
  profileName: '',
  referralCode: '',
  ensName: '',
  secondaryWalletOrEns: '',
  note: '',
};

const COLLECTOR_FIELDS: CollectorField[] = ['displayName', 'email', 'username', 'profileName', 'referralCode', 'ensName', 'secondaryWalletOrEns', 'note'];

function openStore() {
  try {
    return createDraftStore(localStorage);
  } catch {
    return null;
  }
}

function initial(user: SessionUser | null, draft: CheckoutDraft | null): CollectorValues {
  return {
    ...EMPTY,
    displayName: user ? user.displayName : '',
    email: user ? user.email : '',
    username: user ? user.username : '',
    ...(draft ? draft.values : {}),
  };
}

/** Dados do colecionador + rede/carteira escolhidas, com rascunho persistido por usuario. */
export function useCollectorState(user: SessionUser | null) {
  const userId = user ? user.id : '';
  const [store] = useState(openStore);
  const [draft] = useState(() => (userId && store ? store.load(userId) : null));
  const [values, setValues] = useState<CollectorValues>(() => initial(user, draft));
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());
  const [focusField, setFocusField] = useState<CollectorField | null>(null);
  const [networkId, setNetworkId] = useState<NetworkId>(NETWORK_IDS.find((n) => n === draft?.networkId) ?? 'ethereum');
  const [walletId, setWalletId] = useState<string | null>(draft ? draft.walletId : null);

  const saver = useRef(store);
  useEffect(() => {
    if (userId) saver.current?.save(userId, { values, walletId, networkId });
  }, [userId, values, walletId, networkId]);

  const validation = validateCollector(values);
  const errors: CollectorErrors = validation.ok
    ? {}
    : Object.fromEntries(Object.entries(validation.errors).filter(([field]) => touched.has(field)));

  const form: CollectorFormProps = {
    values,
    errors,
    focusField,
    onChange: (field, value) => {
      setValues((current) => ({ ...current, [field]: value }));
      setTouched((current) => new Set(current).add(field));
    },
  };

  const revealErrors = (found: CollectorErrors) => {
    const fields = Object.keys(found);
    setTouched(new Set(fields));
    setFocusField(COLLECTOR_FIELDS.find((field) => field in found) ?? null);
  };

  return {
    form,
    validation,
    revealErrors,
    networkId,
    setNetworkId,
    walletId,
    setWalletId,
    clearDraft: () => {
      if (userId) store?.clear(userId);
    },
  };
}
