import { Checkbox, Label } from '@jg/design-system';
import { useId } from 'react';

import { FilterHeading } from './FilterHeading';

export type CheckboxOption<T extends string> = {
  id: T;
  label: string;
  /** Nome acessivel completo (rotulo + contagem da API); sem contagem usa o rotulo. */
  accessibleName: string;
  count: number | undefined;
};

type CheckboxGroupProps<T extends string> = {
  title: string;
  options: readonly CheckboxOption<T>[];
  selected: readonly T[];
  onToggle: (id: T, checked: boolean) => void;
};

export function CheckboxGroup<T extends string>({ title, options, selected, onToggle }: CheckboxGroupProps<T>) {
  const groupId = useId();
  const titleId = [groupId, 'title'].join('-');
  return (
    <div role="group" aria-labelledby={titleId} className="flex flex-col gap-12">
      <FilterHeading id={titleId}>{title}</FilterHeading>
      <ul className="m-0 flex list-none flex-col p-0 px-12">
        {options.map((option) => {
          const checked = selected.includes(option.id);
          const controlId = [groupId, option.id].join('-');
          const tone = checked ? 'text-text-accent' : 'text-secondary';
          return (
            <li key={option.id} className="flex h-40 items-center gap-10">
              <Checkbox
                id={controlId}
                aria-label={option.accessibleName}
                checked={checked}
                onCheckedChange={(next) => onToggle(option.id, next === true)}
              />
              <Label
                htmlFor={controlId}
                className={['flex-1 cursor-pointer justify-between text-body-15-regular-lh-40', tone].join(' ')}
              >
                <span>{option.label}</span>
                {option.count === undefined ? null : (
                  <span aria-hidden="true" className="text-body-15-bold-lh-40">
                    ({option.count})
                  </span>
                )}
              </Label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
