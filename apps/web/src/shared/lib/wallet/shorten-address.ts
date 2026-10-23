const HEAD = 6;
const TAIL = 4;

/** `0xA91F3b...E82C` -> `0xA91F…E82C`; enderecos/nomes curtos ficam intactos. */
export function shortenAddress(address: string): string {
  if (address.length <= HEAD + TAIL + 1) return address;
  return `${address.slice(0, HEAD)}…${address.slice(-TAIL)}`;
}
