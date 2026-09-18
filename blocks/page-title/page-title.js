/**
 * page-title — the legacy intermediate-template title band (live .pagetitle > .color-bar.blue-bg >
 * .main-content.flex + .brand-color-bar-component): teal 250px band, 16% icon cell, the page h1,
 * and the zero-height brand colour bar (grey / blue / green / navy quarters) hanging 10px into
 * whatever follows. Prototype: stardust/prototypes/support-software-support-proposed.html
 * `.lg-pagetitle`; schema: stardust/eds-schema/support-software-support.json § page-title. Decode
 * tier: template-slotted. Variant `legacy` = this skin (class="page-title legacy").
 *
 * Authoring rows (simple shape):
 *   1. <img alt="…">  the 180×100 icon (editorial, content.da.live URL)
 *   2. <h1>Page title</h1> The live empty `h1.heading-1` sibling is not authored; the four
 *      colour-bar cells are generated decoration (no text). Authored nodes MOVE (EW1).
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

export default function decorate(block) {
  const pic = block.querySelector('picture, img');
  const heading = block.querySelector('h1, h2, h3');

  const bar = el('div', 'pagetitle-bar');
  const content = el('div', 'pagetitle-content');
  if (pic) {
    const icon = el('div', 'pagetitle-icon');
    icon.append(pic.closest('p') || pic);
    content.append(icon);
  }
  if (heading) {
    const text = el('div', 'pagetitle-text');
    text.append(heading);
    content.append(text);
  }
  bar.append(content);

  const colours = el('div', 'brand-color-bar');
  ['grey', 'blue', 'green', 'navy'].forEach((c) => colours.append(el('div', `brand-color-bar-${c}`)));
  const colourWrap = el('div');
  colourWrap.append(colours);

  block.replaceChildren(bar, colourWrap);
}
