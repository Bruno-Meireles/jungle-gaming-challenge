import { Button } from '@jg/design-system';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchIcon } from '../../../shared/ui';
import { SearchForm, type SearchFormProps } from './SearchForm';

/** Desktop e tablet: botao de icone (aria-expanded) que abre o campo; Esc fecha e devolve o foco ao botao. */
export function SearchToggle({ value, onSubmit }: Pick<SearchFormProps, 'value' | 'onSubmit'>) {
  const { t } = useTranslation('search');
  const [open, setOpen] = useState(value !== undefined);
  const [openedByUser, setOpenedByUser] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="hidden items-center gap-8 tablet:flex">
      {open ? (
        <SearchForm
          key={value ?? ''}
          value={value}
          onSubmit={onSubmit}
          autoFocus={openedByUser}
          className="w-240"
          onEscape={() => {
            setOpen(false);
            buttonRef.current?.focus();
          }}
        />
      ) : null}
      <Button
        ref={buttonRef}
        variant="icon"
        aria-label={t('label')}
        aria-expanded={open}
        className="size-35 justify-center"
        onClick={() => {
          setOpenedByUser(true);
          setOpen(!open);
        }}
      >
        <SearchIcon />
      </Button>
    </div>
  );
}
