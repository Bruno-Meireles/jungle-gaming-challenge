/*
 * Ferramenta de teste (nao e codigo de producao do DS): detecta APIs dependentes de locale em fonte TS/TSX
 * por AST (plano design-system-i18n, F4). Comentarios nao fazem parte da AST.
 */
import ts from 'typescript';

const LOCALE_METHODS = new Set([
  'toLocaleString',
  'toLocaleDateString',
  'toLocaleTimeString',
  'toLocaleUpperCase',
  'toLocaleLowerCase',
  'localeCompare',
]);

export function findLocaleApis(source: string): string[] {
  const sf = ts.createSourceFile('input.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const line = (n: ts.Node) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === 'Intl') {
      const p = node.parent;
      const isPropName =
        (ts.isPropertyAccessExpression(p) && p.name === node) ||
        (ts.isPropertyAssignment(p) && p.name === node) ||
        (ts.isPropertySignature(p) && p.name === node) ||
        (ts.isQualifiedName(p) && p.right === node);
      if (!isPropName) found.push(`linha ${line(node)}: Intl`);
    } else if (ts.isPropertyAccessExpression(node)) {
      const name = node.name.text;
      const obj = node.expression;
      if (LOCALE_METHODS.has(name)) {
        found.push(`linha ${line(node)}: ${name}`);
      } else if (ts.isIdentifier(obj) && obj.text === 'navigator' && (name === 'language' || name === 'languages')) {
        found.push(`linha ${line(node)}: navigator.${name}`);
      } else if (
        name === 'lang' &&
        ts.isPropertyAccessExpression(obj) &&
        obj.name.text === 'documentElement' &&
        ts.isIdentifier(obj.expression) &&
        obj.expression.text === 'document'
      ) {
        found.push(`linha ${line(node)}: document.documentElement.lang`);
      }
    } else if (
      ts.isElementAccessExpression(node) &&
      ts.isStringLiteralLike(node.argumentExpression) &&
      LOCALE_METHODS.has(node.argumentExpression.text)
    ) {
      found.push(`linha ${line(node)}: ${node.argumentExpression.text}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}
