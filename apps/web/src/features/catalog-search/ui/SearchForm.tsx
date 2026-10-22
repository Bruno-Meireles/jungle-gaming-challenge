import { Input } from '@jg/design-system';
import type { KeyboardEvent, Ref } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchIcon } from '../../../shared/ui';

export type SearchFormProps = {
  /** Termo atual da URL; vazio/ausente limpa o param. */
  value: string | undefined;
  onSubmit: (query: string | undefined) => void;
  onEscape?: () => void;
  autoFocus?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
};

/** Campo de busca submetido por Enter (push no historico). Remontar com `key={value}` ressincroniza o texto. */
export function SearchForm({ value, onSubmit, onEscape, autoFocus, inputRef, className }: SearchFormProps) {
  const { t } = useTranslation('search');
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Escape' || onEscape === undefined) return;
    // Sem isto o Chromium so limpa o texto do input type=search.
    event.preventDefault();
    onEscape();
  };
  return (
    <form
      role="search"
      aria-label={t('label')}
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        const input = event.currentTarget.elements.namedItem('q');
        const text = input instanceof HTMLInputElement ? input.value.trim() : '';
        onSubmit(text === '' ? undefined : text);
      }}
    >
      <Input
        ref={inputRef}
        name="q"
        type="search"
        aria-label={t('label')}
        placeholder={t('placeholder')}
        defaultValue={value ?? ''}
        autoFocus={autoFocus}
        autoComplete="off"
        maxLength={100}
        startSlot={<SearchIcon />}
        onKeyDown={handleKeyDown}
        className="h-45 rounded-12 border-transparent bg-surface-card"
      />
    </form>
  );
}
