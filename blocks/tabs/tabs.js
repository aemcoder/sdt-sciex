/**
 * tabs — "Why SCIEX portfolio" (live .tab): a row of 7 tab labels on desktop, an accordion
 * of label buttons below 768; one panel per tab with picture (65 %) + title/text/link (35 %).
 * Schema: stardust/eds-schema/index.json § why-sciex-portfolio (7 units: label, h3, body,
 * cta, img). Decode tier: reconstructive (Block Collection `tabs` model — ONE ROW PER TAB,
 * cells: label | content); authored nodes MOVE into the template (EW1–EW3, EW8).
 *
 * Authoring:
 *   section default content: <h2>Why SCIEX portfolio</h2><p>lede</p>   (reabsorbed, EW8)
 *   row: <div>Mass Spectrometers</div>
 *        <div><img src="…" alt=""><h3>Mass Spectrometers</h3><p>text</p>
 *             <p><em><a>Learn more</a></em></p></div>
 *
 * Editability: the label <p> lives in the desktop tab bar (the visible tab at authoring
 * widths); the mobile accordion button carries a presentational clone (EW4). Tabs are
 * div[role=tab] (a <button> cannot host the editor, EW7) with keyboard support.
 */

const CHEVRON = '<svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 5L8 11L14 5" stroke="currentColor"></path></svg>';

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function stripInstrumentation(node) {
  node.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  node.removeAttribute('data-prose-index');
  return node;
}

// Cell → its element children; a bare-text cell (pipeline-unwrapped single paragraph, or
// the harness) has its text node moved into a fresh <p> (never copied — EW5).
function cellNodes(cell) {
  if (!cell) return [];
  let kids = [...cell.children];
  // #104 — the runtime's wrapTextNodes folds a MEDIA-LED or unlisted-first-child cell into
  // ONE <p>; expand it back so the siblings after the image are not lost. A bare text node
  // inside that wrapper is moved into a fresh <p> (HARNESS-ONLY fallback, EW5 — never copied).
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img, span.icon')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      if (n.textContent.trim()) { const p = document.createElement('p'); p.append(n); return p; }
      return null;
    }).filter(Boolean);
  }
  if (kids.length) return kids;
  if (cell.textContent.trim()) { const p = document.createElement('p'); p.append(...cell.childNodes); return [p]; }
  return [];
}

function makeTab(index, controls, className) {
  const tab = el('div', className);
  tab.setAttribute('role', 'tab');
  tab.tabIndex = 0;
  tab.setAttribute('aria-controls', controls);
  tab.dataset.tab = String(index);
  return tab;
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const uid = Math.random().toString(36).slice(2, 7);

  const items = rows.map((row, i) => {
    const cells = [...row.children];
    const labelNodes = cellNodes(cells[0]);
    const content = cellNodes(cells.length > 1 ? cells[cells.length - 1] : null);
    const media = content.find((n) => n.matches('picture, img') || n.querySelector('picture, img')) || null;
    const heading = content.find((n) => /^H[1-6]$/.test(n.tagName)) || null;
    const ctas = content.filter((n) => n !== media && n !== heading && n.querySelector('a'));
    const texts = content.filter((n) => n !== media && n !== heading && !ctas.includes(n));
    return {
      id: `tab-${uid}-${i}`, label: labelNodes[0] || null, extraLabel: labelNodes.slice(1), media, heading, ctas, texts,
    };
  });

  const col = el('div', 'tabs-col');

  // section head (default content before the block) — moved whole (EW8)
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    const head = el('div', 'container tabs-head');
    const inner = el('div');
    inner.append(...prev.childNodes);
    prev.remove();
    head.append(inner);
    col.append(head);
  }

  // desktop bar: the authored label <p> lives here (editable), inside a div[role=tab]
  const bar = el('div', 'container tabs-bar');
  bar.setAttribute('role', 'tablist');
  items.forEach((it, i) => {
    const cell = el('div', i === 0 ? 'is-active' : '');
    const tab = makeTab(i, it.id, 'tabs-tab');
    if (it.label) tab.append(it.label);
    it.extraLabel.forEach((n) => tab.append(n));
    cell.append(tab);
    bar.append(cell);
    it.tab = tab;
    it.cell = cell;
  });
  col.append(bar);

  // mobile accordion buttons + panels
  items.forEach((it, i) => {
    const mob = makeTab(i, it.id, `tabs-mob-btn${i === 0 ? ' is-active' : ''}`);
    const mobInner = el('div', 'container');
    const clone = it.label ? stripInstrumentation(it.label.cloneNode(true)) : el('p');
    const icon = el('div', 'tabs-mob-btn-icon');
    icon.innerHTML = CHEVRON;
    mobInner.append(clone, icon);
    mob.append(mobInner);
    it.mob = mob;

    const grid = el('div', `container tabs-panel-grid${i === 0 ? ' is-active' : ''}`);
    if (i !== 0) grid.setAttribute('aria-hidden', 'true');
    const panel = el('div', 'tabs-panel');
    panel.id = it.id;
    panel.setAttribute('role', 'tabpanel');
    const inner = el('div', 'tabs-panel-inner');
    if (it.media) {
      const m = el('div', 'tabs-panel-media');
      m.append(it.media);
      inner.append(m);
    }
    const text = el('div', 'tabs-panel-text');
    if (it.heading) { const t = el('div', 'tabs-panel-title'); t.append(it.heading); text.append(t); }
    it.texts.forEach((p) => text.append(p));
    if (it.ctas.length) { const l = el('div', 'tabs-panel-link'); l.append(...it.ctas); text.append(l); }
    inner.append(text);
    panel.append(inner);
    grid.append(panel);
    it.grid = grid;
    col.append(mob, grid);
  });

  const setTab = (n) => {
    items.forEach((it, k) => {
      const on = k === n;
      it.cell.classList.toggle('is-active', on);
      it.tab.setAttribute('aria-selected', on ? 'true' : 'false');
      it.tab.setAttribute('aria-expanded', on ? 'true' : 'false');
      it.mob.classList.toggle('is-active', on);
      it.mob.setAttribute('aria-expanded', on ? 'true' : 'false');
      it.grid.classList.toggle('is-active', on);
      if (on) it.grid.removeAttribute('aria-hidden'); else it.grid.setAttribute('aria-hidden', 'true');
    });
  };
  items.forEach((it, i) => {
    [it.tab, it.mob].forEach((t) => {
      t.addEventListener('click', () => setTab(i));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTab(i); }
        if (e.key === 'ArrowRight') items[(i + 1) % items.length].tab.focus();
        if (e.key === 'ArrowLeft') items[(i + items.length - 1) % items.length].tab.focus();
      });
    });
  });
  setTab(0);

  block.replaceChildren(col);
}
