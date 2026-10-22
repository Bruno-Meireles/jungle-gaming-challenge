/*
 * Serializacao de search params da Home. O parser padrao do TanStack converte "123" e "1.5" em number, o que perde
 * precisao nos precos em ETH (18 casas): aqui tudo e string, exceto `page` (inteiro canonico) e as listas
 * `collections`/`networks` (chave repetida na URL, sempre array). A validacao de dominio fica no `homeSearchSchema`.
 */
const LIST_KEYS: ReadonlySet<string> = new Set(['collections', 'networks']);
const CANONICAL_PAGE = /^[1-9]\d{0,8}$/;

export function parseSearch(searchStr: string): Record<string, unknown> {
  const params = new URLSearchParams(searchStr);
  const result: Record<string, unknown> = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    if (LIST_KEYS.has(key)) result[key] = values;
    else if (key === 'page') result[key] = CANONICAL_PAGE.test(values[0] ?? '') ? Number(values[0]) : values[0];
    else result[key] = values[0];
  }
  return result;
}

function appendValue(params: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    for (const item of value) appendValue(params, key, item);
    return;
  }
  params.append(key, String(value));
}

export function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) appendValue(params, key, value);
  const text = params.toString();
  return text === '' ? '' : `?${text}`;
}
