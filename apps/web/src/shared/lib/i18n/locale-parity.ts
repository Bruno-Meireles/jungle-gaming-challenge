export type Messages = { [key: string]: string | Messages };

type Node = string | Messages | undefined;

const PLACEHOLDER = /\{\{\s*([^}\s]+)\s*\}\}/g;

function placeholdersOf(text: string): string[] {
  return Array.from(text.matchAll(PLACEHOLDER), (match) => match[1] ?? '').sort();
}

function isBranch(node: Node): node is Messages {
  return typeof node === 'object';
}

function compareStrings(path: string, base: string, other: string): string[] {
  const a = placeholdersOf(base).join(',');
  const b = placeholdersOf(other).join(',');
  return a === b ? [] : [`${path}: placeholders diferentes: base [${a}] other [${b}]`];
}

function compareNodes(path: string, base: Node, other: Node): string[] {
  if (base === undefined) return [`${path}: sobra em other`];
  if (other === undefined) return [`${path}: ausente em other`];
  if (isBranch(base) && isBranch(other)) return compareBranches(base, other, path);
  if (typeof base === 'string' && typeof other === 'string') {
    return compareStrings(path, base, other);
  }
  return [`${path}: tipo divergente`];
}

function compareBranches(base: Messages, other: Messages, prefix: string): string[] {
  const keys = new Set([...Object.keys(base), ...Object.keys(other)]);
  return [...keys].flatMap((key) =>
    compareNodes(prefix === '' ? key : `${prefix}.${key}`, base[key], other[key]),
  );
}

export function findParityIssues(base: Messages, other: Messages): string[] {
  return compareBranches(base, other, '').sort();
}
