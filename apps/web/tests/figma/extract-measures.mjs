// Extrai de docs/figma/file.json apenas os nos usados pelos testes de medida (*.measure.test.tsx) e grava measures.json.
// Uso (na pasta apps/web): node tests/figma/extract-measures.mjs
// Cada entrada guarda valor, id do no e a linha de docs/figma/file.json (citacao arquivo:linha).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const figmaPath = path.resolve(here, '../../../../docs/figma/file.json');
const raw = fs.readFileSync(figmaPath, 'utf8');
const lines = raw.split('\n');
const doc = JSON.parse(raw).document;

const nodes = new Map();
(function walk(n) {
  nodes.set(n.id, n);
  (n.children ?? []).forEach(walk);
})(doc);

const lineOf = (id) => lines.findIndex((l) => l.trim() === `"id": ${JSON.stringify(id)},`) + 1;
const hex = (c) => `#${[c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`;
const box = (id) => nodes.get(id).absoluteBoundingBox;
const solid = (list) => (list ?? []).find((f) => f.visible !== false && f.type === 'SOLID');

function read(id, prop, refId) {
  const n = nodes.get(id);
  if (!n) throw new Error(`no ${id} ausente`);
  const b = box(id);
  switch (prop) {
    case 'w': return b.width;
    case 'h': return b.height;
    case 'gap': return n.itemSpacing ?? 0;
    case 'padL': return n.paddingLeft ?? 0;
    case 'padT': return n.paddingTop ?? 0;
    case 'radius': return n.cornerRadius ?? 0;
    case 'fs': return n.style.fontSize;
    case 'fw': return n.style.fontWeight;
    case 'lh': return n.style.lineHeightPx;
    case 'font': return n.style.fontFamily;
    case 'fill': return hex(solid(n.fills).color);
    case 'stroke': return hex(solid(n.strokes).color);
    case 'strokeW': return n.strokeWeight;
    case 'shadow': {
      const e = n.effects.find((x) => x.type === 'DROP_SHADOW' && x.visible);
      const { r, g, b: bl, a } = e.color;
      return { rgb: [r, g, bl].map((v) => Math.round(v * 255)), alpha: +a.toFixed(2), x: e.offset.x, y: e.offset.y, blur: e.radius };
    }
    // distancias entre dois nos (ref e o irmao/ancestral de referencia)
    case 'gapBelow': return b.y - (box(refId).y + box(refId).height); // topo de id menos base de ref
    case 'relTop': return b.y - box(refId).y;
    case 'relLeft': return b.x - box(refId).x;
    case 'relBottom': return box(refId).y + box(refId).height - (b.y + b.height); // base de ref menos base de id
    default: throw new Error(`prop ${prop}`);
  }
}

const H = 'I70522:3240;70504:3015';
const F = 'I70485:382';
const spec = {
  // Header (desktop 2:2)
  'header.top': ['70522:3240', 'relTop', '2:2'],
  'header.logo.w': [`${H};70486:509`, 'w'],
  'header.logo.h': [`${H};70486:509`, 'h'],
  'header.brand.font': [`${H};70486:510`, 'font'],
  'header.brand.fs': [`${H};70486:510`, 'fs'],
  'header.brand.fw': [`${H};70486:510`, 'fw'],
  'header.brand.fill': [`${H};70486:510`, 'fill'],
  'header.nav.gap': [`${H};70486:511`, 'gap'],
  'header.navItem.h': [`${H};70486:512`, 'h'],
  'header.navActive.fs': [`${H};70486:513`, 'fs'],
  'header.navActive.fw': [`${H};70486:513`, 'fw'],
  'header.navActive.lh': [`${H};70486:513`, 'lh'],
  'header.navActive.fill': [`${H};70486:513`, 'fill'],
  'header.navActive.underlineW': [`${H};70486:514`, 'strokeW'],
  'header.navActive.underlineFill': [`${H};70486:514`, 'stroke'],
  'header.navInactive.fs': [`${H};70486:515`, 'fs'],
  'header.navInactive.fw': [`${H};70486:515`, 'fw'],
  'header.navInactive.lh': [`${H};70486:515`, 'lh'],
  'header.navInactive.fill': [`${H};70486:515`, 'fill'],
  'header.actions.gap': [`${H};70486:518`, 'gap'],
  'header.search.w': [`${H};70486:519`, 'w'],
  'header.cart.w': [`${H};70486:521`, 'w'],
  'header.login.w': [`${H};70486:525`, 'w'],
  'header.login.h': [`${H};70486:525`, 'h'],
  'header.login.radius': [`${H};70486:525`, 'radius'],
  'header.login.fill': [`${H};70486:525`, 'fill'],
  'header.login.gap': [`${H};70486:526`, 'gap'],
  'header.login.fs': [`${H};70486:528`, 'fs'],
  'header.login.fw': [`${H};70486:528`, 'fw'],
  'header.login.fill.text': [`${H};70486:528`, 'fill'],
  'header.divider.stroke': ['I70522:3240;70504:3016', 'stroke'],
  'header.divider.w': ['I70522:3240;70504:3016', 'strokeW'],

  // Hero desktop (2:2)
  'hero.h': ['70347:239', 'h'],
  'hero.padL': ['70347:239', 'padL'],
  'hero.gap': ['70342:2674', 'gap'],
  'hero.copy.w': ['70342:2672', 'w'],
  'hero.copy.top': ['70342:2672', 'relTop', '70347:239'],
  'hero.image.w': ['70342:2673', 'w'],
  'hero.image.h': ['70342:2673', 'h'],
  'hero.image.radius': ['70342:2673', 'radius'],
  'hero.eyebrow.fs': ['3:113', 'fs'],
  'hero.eyebrow.fw': ['3:113', 'fw'],
  'hero.eyebrow.lh': ['3:113', 'lh'],
  'hero.title.font': ['3:107', 'font'],
  'hero.title.fs': ['3:107', 'fs'],
  'hero.title.fw': ['3:107', 'fw'],
  'hero.title.lh': ['3:107', 'lh'],
  'hero.title.fill': ['3:107', 'fill'],
  'hero.text.fs': ['3:114', 'fs'],
  'hero.text.lh': ['3:114', 'lh'],
  'hero.text.w': ['3:114', 'w'],
  'hero.text.fill': ['3:114', 'fill'],
  'hero.gap.eyebrowTitle': ['3:107', 'gapBelow', '3:113'],
  'hero.gap.titleText': ['3:114', 'gapBelow', '3:107'],
  'hero.gap.textButton': ['70342:2667', 'gapBelow', '3:114'],
  'hero.button.w': ['70342:2667', 'w'],
  'hero.button.h': ['70342:2667', 'h'],
  'hero.button.radius': ['70342:2667', 'radius'],
  'hero.button.fill': ['70342:2667', 'fill'],
  'hero.button.fs': ['3:127', 'fs'],
  'hero.button.fw': ['3:127', 'fw'],
  'hero.button.lh': ['3:127', 'lh'],
  'hero.button.fill.text': ['3:127', 'fill'],
  'hero.dot.w': ['3:128', 'w'],
  'hero.dot.pitch': ['3:128', 'relLeft', '3:130'],
  'hero.dot.bottom': ['3:128', 'relBottom', '70347:239'],
  'hero.dot.left': ['3:130', 'relLeft', '70347:239'],
  'hero.dot.fill': ['3:128', 'fill'],

  // Hero mobile (14:5226, quadro de 414)
  'heroM.left': ['70395:240', 'relLeft', '14:5226'],
  'heroM.h': ['70395:240', 'h'],
  'heroM.padL': ['70395:240', 'padL'],
  'heroM.gap': ['70410:4129', 'gap'],
  'heroM.image.w': ['14:5238', 'w'],
  'heroM.image.h': ['14:5238', 'h'],
  'heroM.image.radius': ['14:5238', 'radius'],
  'heroM.eyebrow.fs': ['14:5288', 'fs'],
  'heroM.eyebrow.fw': ['14:5288', 'fw'],
  'heroM.eyebrow.lh': ['14:5288', 'lh'],
  'heroM.title.fs': ['14:5234', 'fs'],
  'heroM.title.fw': ['14:5234', 'fw'],
  'heroM.title.lh': ['14:5234', 'lh'],
  'heroM.text.fs': ['14:5289', 'fs'],
  'heroM.text.lh': ['14:5289', 'lh'],
  'heroM.text.fill': ['14:5289', 'fill'],
  'heroM.gap.eyebrowTitle': ['14:5234', 'gapBelow', '14:5288'],
  'heroM.gap.titleText': ['14:5289', 'gapBelow', '14:5234'],
  'heroM.explore.fs': ['15:5294', 'fs'],
  'heroM.explore.fw': ['15:5294', 'fw'],
  'heroM.explore.fill': ['15:5294', 'fill'],

  // Sidebar de filtros (desktop)
  'side.w': ['70485:382', 'w'],
  'side.padL': ['70485:382', 'padL'],
  'side.padT': ['70485:382', 'padT'],
  'side.radius': ['70485:382', 'radius'],
  'side.fill': ['70485:382', 'fill'],
  'side.gap.groups': [`${F};70485:357`, 'gapBelow', `${F};70485:318`],
  'side.title.fs': [`${F};70485:319`, 'fs'],
  'side.title.fw': [`${F};70485:319`, 'fw'],
  'side.title.fill': [`${F};70485:319`, 'fill'],
  'side.gap.titleList': [`${F};70485:320`, 'gapBelow', `${F};70485:319`],
  'side.row.h': [`${F};70485:321`, 'h'],
  'side.row.fs': [`${F};70485:323`, 'fs'],
  'side.networkRow.h': [`${F};70485:372`, 'h'],
  'side.price.fs': [`${F};70485:366`, 'fs'],
  'side.price.fill': [`${F};70485:366`, 'fill'],
  'side.apply.w': [`${F};70485:367`, 'w'],
  'side.apply.h': [`${F};70485:367`, 'h'],
  'side.apply.radius': [`${F};70485:367`, 'radius'],
  'side.apply.fill': [`${F};70485:367`, 'fill'],
  'side.apply.fs': [`${F};70485:368`, 'fs'],
  'side.apply.fw': [`${F};70485:368`, 'fw'],
  'side.thumb.w': [`${F};70485:361`, 'w'],
  'sideM.filterButton.w': ['70410:4122', 'w'],
  'sideM.filterButton.h': ['70410:4122', 'h'],
  'sideM.filterButton.radius': ['70410:4122', 'radius'],

  // Toolbar (abas e ordenacao)
  'toolbar.tabs.gap': ['70351:240', 'gap'],
  'toolbar.tab.fs': ['4:138', 'fs'],
  'toolbar.tab.fw': ['4:138', 'fw'],
  'toolbar.tabActive.fill': ['4:138', 'fill'],
  'toolbar.tabInactive.fill': ['4:144', 'fill'],
  'toolbar.underline.w': ['4:146', 'strokeW'],
  'toolbar.underline.fill': ['4:146', 'stroke'],
  'toolbar.sort.fs': ['4:147', 'fs'],
  'toolbar.sort.fw': ['4:147', 'fw'],
  'toolbar.sort.fill': ['4:147', 'fill'],
  'toolbar.sort.w': ['70351:241', 'w'],
  'toolbar.gap.grid': ['70342:2828', 'gapBelow', '70351:239'],
  'toolbarM.tabs.gap': ['70367:2847', 'gap'],
  'toolbarM.tabActive.fs': ['15:5361', 'fs'],
  'toolbarM.tabActive.fw': ['15:5361', 'fw'],
  'toolbarM.tabActive.fill': ['15:5361', 'fill'],
  'toolbarM.tabInactive.fs': ['15:5363', 'fs'],
  'toolbarM.tabInactive.fw': ['15:5363', 'fw'],
  'toolbarM.underline.w': ['15:5366', 'strokeW'],
  'toolbarM.gap.grid': ['70395:242', 'gapBelow', '70395:241'],

  // Grade
  'grid.w': ['70342:2830', 'w'],
  'grid.col.w': ['70342:2678', 'w'],
  'grid.gap.col': ['70342:2802', 'gap'],
  'grid.gap.row': ['70342:2828', 'gap'],
  'gridM.gap.col': ['70395:242', 'gap'],
  'gridM.gap.row': ['70395:243', 'gap'],
  'gridM.colR.offset': ['70395:244', 'padT'],

  // Barra inferior (mobile)
  'tabbar.bar.h': ['15:5504', 'h'],
  'tabbar.bar.fill': ['15:5504', 'fill'],
  'tabbar.bar.shadow': ['15:5504', 'shadow'],
  'tabbar.center.w': ['15:5507', 'w'],
  'tabbar.center.h': ['15:5507', 'h'],
  'tabbar.center.rise': ['15:5504', 'relTop', '15:5507'],
  'tabbar.icon.w': ['15:5519', 'w'],
  'tabbar.icon.h': ['15:5519', 'h'],
  'tabbar.icon.fill': ['15:5523', 'fill'],
  'tabbar.home.left': ['15:5519', 'relLeft', '15:5504'],
  'tabbar.scan.w': ['15:5529', 'w'],
  'tabbar.scan.h': ['15:5529', 'h'],
  'tabbar.scan.fill': ['15:5530', 'fill'],
};

const out = {};
for (const [key, [id, prop, ref]] of Object.entries(spec)) {
  const value = read(id, prop, ref);
  out[key] = { value, node: id, ...(ref ? { ref } : {}), prop, source: `docs/figma/file.json:${lineOf(id)}` };
}
fs.writeFileSync(path.join(here, 'measures.json'), `${JSON.stringify(out, null, 2)}\n`);
process.stdout.write(`${Object.keys(out).length} medidas gravadas
`);
