import { SearchForm, type SearchFormProps } from './SearchForm';

/** Mobile: campo sempre visivel, como no frame do Figma. */
export function SearchField({ value, onSubmit, className }: Pick<SearchFormProps, 'value' | 'onSubmit' | 'className'>) {
  return <SearchForm key={value ?? ''} value={value} onSubmit={onSubmit} className={className} />;
}
