import { useTranslation } from 'react-i18next';

export type LooseTranslate = (key: string, options?: Record<string, string | number>) => string;

/**
 * Ponte para view models de dominio que recebem uma porta `t` com chave em string: o tipo estrito do i18next
 * nao aceita chaves dinamicas, e o conteudo e validado pelos testes de paridade dos locales.
 */
export function useLooseTranslate(): LooseTranslate {
  const { i18n } = useTranslation();
  // eslint-disable-next-line no-restricted-syntax
  return (key, options) => String(i18n.t(key as never, options as never));
}
