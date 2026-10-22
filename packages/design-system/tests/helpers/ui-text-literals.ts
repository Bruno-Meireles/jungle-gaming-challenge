/*
 * Ferramenta de teste (nao e codigo de producao do DS): detecta texto de interface literal em fonte TS/TSX
 * por AST. Formas reprovadas (plano design-system-i18n, A1): texto JSX com letra; glifo sem letra sem
 * aria-hidden="true"; literal com letra em atributos de texto de interface; default de parametro de rotulo;
 * propriedade label/*Label/title com literal fora de cva()/cn(). Comentarios nao fazem parte da AST.
 */
import ts from 'typescript';

export type UiTextViolation = { file: string; line: number; text: string };

const LETTER = /\p{L}/u;
const TEXT_ATTRIBUTES = new Set([
  'aria-label',
  'aria-description',
  'aria-roledescription',
  'aria-valuetext',
  'aria-placeholder',
  'alt',
  'title',
  'placeholder',
]);
const CLASS_HELPERS = new Set(['cva', 'cn', 'clsx', 'cx', 'twMerge']);
const PROP_NAME = /^(label|title|placeholder|alt)$|Labels?$|[tT]ext$/;
const PARAM_NAME = /^(placeholder|alt)$|[lL]abels?$|[tT]ext$|[tT]itle$/;

const isStringLike = (n: ts.Node): n is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral =>
  ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n);

function literalsWithLetter(node: ts.Node, out: (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral)[] = []) {
  if (isStringLike(node) && LETTER.test(node.text)) out.push(node);
  ts.forEachChild(node, (c) => literalsWithLetter(c, out));
  return out;
}

function insideClassHelper(node: ts.Node): boolean {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isCallExpression(p) && ts.isIdentifier(p.expression) && CLASS_HELPERS.has(p.expression.text)) return true;
  }
  return false;
}

function hasAriaHiddenTrue(el: ts.JsxElement): boolean {
  return el.openingElement.attributes.properties.some(
    (a) =>
      ts.isJsxAttribute(a) &&
      a.name.getText() === 'aria-hidden' &&
      a.initializer !== undefined &&
      ((ts.isStringLiteral(a.initializer) && a.initializer.text === 'true') ||
        (ts.isJsxExpression(a.initializer) && a.initializer.expression?.kind === ts.SyntaxKind.TrueKeyword)),
  );
}

function ancestorAriaHidden(node: ts.Node): boolean {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isJsxElement(p) && hasAriaHiddenTrue(p)) return true;
  }
  return false;
}

export function findUiTextLiterals(source: string, fileName: string): UiTextViolation[] {
  const kind = fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, kind);
  const found: UiTextViolation[] = [];

  const report = (text: string, offset: number) => {
    found.push({ file: fileName, line: sf.getLineAndCharacterOfPosition(offset).line + 1, text: text.trim() });
  };

  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) {
      const trimmed = node.text.trim();
      if (trimmed !== '' && (LETTER.test(trimmed) || !ancestorAriaHidden(node))) {
        report(trimmed, node.pos + node.text.indexOf(trimmed));
      }
    } else if (ts.isJsxAttribute(node) && TEXT_ATTRIBUTES.has(node.name.getText()) && node.initializer) {
      for (const lit of literalsWithLetter(node.initializer)) {
        report(`${node.name.getText()}=${lit.text}`, lit.getStart(sf));
      }
    } else if ((ts.isParameter(node) || ts.isBindingElement(node)) && node.initializer && ts.isIdentifier(node.name)) {
      if (PARAM_NAME.test(node.name.text) && isStringLike(node.initializer) && LETTER.test(node.initializer.text)) {
        report(`${node.name.text} = ${node.initializer.text}`, node.initializer.getStart(sf));
      }
    } else if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))) {
      if (PROP_NAME.test(node.name.text) && !insideClassHelper(node)) {
        for (const lit of literalsWithLetter(node.initializer)) {
          report(`${node.name.text}: ${lit.text}`, lit.getStart(sf));
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}
