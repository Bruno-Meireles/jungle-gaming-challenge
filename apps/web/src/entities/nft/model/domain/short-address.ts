const HEAD = 6;
const TAIL = 4;

export function shortAddress(address: string): string {
  if (address.length <= HEAD + TAIL) return address;
  return `${address.slice(0, HEAD)}…${address.slice(-TAIL)}`;
}
