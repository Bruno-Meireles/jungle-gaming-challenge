// Testes de tipo: checados só pelo `tsc` (não casam com os padrões do Vitest).
// Cada `@ts-expect-error` prova que omitir a prop de rótulo deixa de compilar.
import { DialogClose, PasswordInput, SheetClose } from '../src';

export const _t1 = () => (
  <>
    <DialogClose closeLabel="Fechar" />
    <SheetClose closeLabel="Close" />
    {/* @ts-expect-error DialogClose exige closeLabel (sem default) */}
    <DialogClose />
    {/* @ts-expect-error SheetClose exige closeLabel (sem default) */}
    <SheetClose />
  </>
);

export const _t2 = () => (
  <>
    <PasswordInput showLabel="Mostrar" hideLabel="Ocultar" />
    {/* @ts-expect-error PasswordInput exige showLabel (sem default) */}
    <PasswordInput hideLabel="Ocultar" />
    {/* @ts-expect-error PasswordInput exige hideLabel (sem default) */}
    <PasswordInput showLabel="Mostrar" />
  </>
);
