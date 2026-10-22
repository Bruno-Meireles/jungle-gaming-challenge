// Testes de tipo: checados só pelo `tsc` (não casam com os padrões do Vitest).
// Cada `@ts-expect-error` prova que omitir a prop de rótulo deixa de compilar.
import { DialogClose, SheetClose } from '../src';

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
