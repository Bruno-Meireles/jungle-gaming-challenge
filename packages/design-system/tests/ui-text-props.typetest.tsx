// Testes de tipo: checados só pelo `tsc` (não casam com os padrões do Vitest).
// Cada `@ts-expect-error` prova que omitir a prop de rótulo deixa de compilar.
import { Alert, Breadcrumb, BreadcrumbItem, BreadcrumbPage, DialogClose, Pagination, PasswordInput, QuantityStepper, SheetClose } from '../src';

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

export const _t3 = () => (
  <>
    <QuantityStepper
      value={1}
      min={0}
      max={5}
      onValueChange={() => {}}
      label="Quantidade"
      decrementLabel="Diminuir"
      incrementLabel="Aumentar"
    />
    {/* @ts-expect-error QuantityStepper exige decrementLabel (sem default) */}
    <QuantityStepper
      value={1}
      min={0}
      max={5}
      onValueChange={() => {}}
      label="Quantidade"
      incrementLabel="Aumentar"
    />
    {/* @ts-expect-error QuantityStepper exige incrementLabel (sem default) */}
    <QuantityStepper
      value={1}
      min={0}
      max={5}
      onValueChange={() => {}}
      label="Quantidade"
      decrementLabel="Diminuir"
    />
  </>
);

export const _t4 = () => (
  <>
    <Alert tone="info" toneLabel="Info">
      texto
    </Alert>
    <Alert tone="error" toneLabel="Erro" title="Título" action={<button type="button">Ok</button>}>
      texto
    </Alert>
    {/* @ts-expect-error Alert exige toneLabel (sem default) */}
    <Alert tone="info">texto</Alert>
  </>
);

export const _t5 = () => (
  <>
    <Breadcrumb label="Trilha">
      <BreadcrumbItem>
        <BreadcrumbPage>Pagamento</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
    {/* @ts-expect-error Breadcrumb exige label (sem default) */}
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbPage>Pagamento</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  </>
);

export const _t6 = () => (
  <>
    <Pagination page={1} pageCount={3} label="Paginação" nextLabel="Próxima" />
    {/* @ts-expect-error Pagination exige label (sem default) */}
    <Pagination page={1} pageCount={3} nextLabel="Próxima" />
    {/* @ts-expect-error Pagination exige nextLabel (sem default) */}
    <Pagination page={1} pageCount={3} label="Paginação" />
  </>
);
