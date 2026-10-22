// Teste de tipo: checado só pelo `tsc` (não casa com os padrões do Vitest).
// Cada `@ts-expect-error` prova que chave/namespace inexistente deixa de compilar.
import { useTranslation } from 'react-i18next';

export function I18nKeysTypeTest() {
  const { t } = useTranslation();
  return (
    <>
      <p>{t('shared:skipLink')}</p>
      {/* @ts-expect-error chave inexistente em namespace real (shared) */}
      <p>{t('shared:chaveInexistente')}</p>
      {/* @ts-expect-error chave inexistente em outro namespace real (pageHome) */}
      <p>{t('pageHome:nope')}</p>
      {/* @ts-expect-error namespace inexistente */}
      <p>{t('namespaceInexistente:skipLink')}</p>
    </>
  );
}
