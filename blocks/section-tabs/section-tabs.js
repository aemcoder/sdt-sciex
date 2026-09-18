/**
 * section-tabs — live v3 `.tabs.panelcontainer` (cmp-tabs) on /products/software: a desktop tab
 * bar (160 px buttons, 2 px underline), a mobile select button with an absolute dropdown + scrim,
 * and one grid wrapper per panel (1fr active / 0fr others, .3s below 768). Panels hold WHOLE
 * SECTIONS (text containers, card grids, an accordion) — structure the Block Collection `tabs`
 * row model
 * (label | content cell) cannot express without nesting blocks (D2) — hence a block that adopts
 * its sibling sections.
 * Schema: stardust/eds-schema/products-software.json § tabs (4 units, 91 editable texts).
 * Decode tier: reconstructive; authored nodes MOVE (EW1–EW3, EW7–EW9).
 *
 * Authoring:
 *   section default content before the block: <h3>title</h3> [<p>lede</p>]   (reabsorbed, EW8)
 *   block rows — ONE ROW PER TAB, one cell: <p>Label</p>
 *   panels — the sections that FOLLOW the block's section, each carrying section-metadata
 *     `tab | <Label>` (the pipeline emits data-tab="<Label>"); consecutive sections with the same
 *     label form that tab's panel, in authored order. A section inside a panel may itself carry
 *     `accordion | <Item>` for the `accordion` block (which adopts its own siblings the same way).
 *   Rows and sections are matched on the normalised label text; a section whose label matches
 *   no row stays where it is (visible after the tabs) — never silently dropped.
 *
 * Editability: the authored label <p> lives in the desktop tab (visible at authoring widths) inside
 * a div[role=tab] (EW7); the mobile button/dropdown carry presentational clones (EW4). Adopted
 * sections move whole, undecorated — the runtime loads them in place (EW9: no module state).
 * Variant `stacked-labels` mirrors the live page-level style injection (inactive desktop tab
 * labels word-wrap one word per line — word-spacing: 100vw).
 */

const CHEVRON = '<svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17 7.00043L10 14.0004L3 7.00043" stroke="currentColor"></path></svg>';

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

// Cell → its element children; a bare-text cell has its text node moved into a fresh <p>
// (HARNESS-ONLY fallback, EW5 — never copied).
function cellNodes(cell) {
  if (!cell) return [];
  const kids = [...cell.children];
  if (kids.length) return kids;
  if (cell.textContent.trim()) { const p = document.createElement('p'); p.append(...cell.childNodes); return [p]; }
  return [];
}

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const uid = Math.random().toString(36).slice(2, 7);
  const items = rows.map((row, i) => {
    const nodes = cellNodes(row.firstElementChild);
    return {
      id: `stabs-${uid}-${i}`, label: nodes[0] || null, extra: nodes.slice(1), key: norm(nodes.map((n) => n.textContent).join(' ')), sections: [],
    };
  });

  // adopt the following sibling sections carrying data-tab (pipeline: section-metadata `tab`)
  const section = block.closest('.section') || block.parentElement.parentElement;
  let sib = section ? section.nextElementSibling : null;
  while (sib && sib.dataset && sib.dataset.tab !== undefined) {
    const next = sib.nextElementSibling;
    const key = norm(sib.dataset.tab);
    const item = items.find((it) => it.key === key);
    if (item) item.sections.push(sib);
    sib = next;
  }

  const col = el('div', 'stabs-col');

  // section head (default content before the block) — moved whole (EW8)
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    const head = el('div', 'stabs-head container');
    head.append(...prev.childNodes);
    prev.remove();
    col.append(head);
  }

  // desktop bar: the authored label <p> lives here (editable), inside a div[role=tab] (EW7)
  const bar = el('div', 'stabs-bar container');
  bar.setAttribute('role', 'tablist');
  items.forEach((it, i) => {
    const tab = el('div', `stabs-tab${i === 0 ? ' is-active' : ''}`);
    const btn = el('div', 'stabs-btn');
    btn.setAttribute('role', 'tab');
    btn.tabIndex = 0;
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.setAttribute('aria-controls', `${it.id}-panel`);
    btn.id = `${it.id}-tab`;
    if (it.label) btn.append(it.label);
    it.extra.forEach((n) => btn.append(n));
    tab.append(btn);
    bar.append(tab);
    it.tab = tab;
    it.btn = btn;
  });
  col.append(bar);

  // mobile: select button (one label per tab, active one shown) + dropdown + scrim
  const mobile = el('div', 'stabs-mobile');
  const mobBtn = el('button', 'stabs-mob-btn');
  mobBtn.type = 'button';
  mobBtn.setAttribute('aria-expanded', 'false');
  mobBtn.setAttribute('aria-controls', `${uid}-dropdown`);
  const mobInner = el('div', 'stabs-mob-inner');
  items.forEach((it, i) => {
    const l = el('span', `stabs-mob-label${i === 0 ? ' is-active' : ''}`);
    if (it.label) l.append(stripInstrumentation(it.label.cloneNode(true)));
    mobInner.append(l);
    it.mobLabel = l;
  });
  const icon = el('div', 'stabs-mob-icon');
  icon.innerHTML = CHEVRON;
  mobInner.append(icon);
  mobBtn.append(mobInner);
  const dropdown = el('div', 'stabs-dropdown');
  dropdown.id = `${uid}-dropdown`;
  items.forEach((it, i) => {
    const b = el('button', `stabs-mob-item${i === 0 ? ' is-hidden' : ''}`);
    b.type = 'button';
    const inner = el('div', 'stabs-mob-inner');
    const l = el('span');
    if (it.label) l.append(stripInstrumentation(it.label.cloneNode(true)));
    const ic = el('div', 'stabs-mob-icon');
    ic.innerHTML = CHEVRON;
    inner.append(l, ic);
    b.append(inner);
    dropdown.append(b);
    it.mobItem = b;
  });
  mobile.append(mobBtn, dropdown);
  col.append(mobile);
  const scrim = el('div', 'stabs-scrim');
  col.append(scrim);

  // panels: the adopted sections move whole (EW9)
  items.forEach((it, i) => {
    const grid = el('div', `stabs-panel-grid container${i === 0 ? ' is-active' : ''}`);
    const panel = el('div', 'stabs-panel');
    panel.setAttribute('role', 'tabpanel');
    panel.id = `${it.id}-panel`;
    panel.setAttribute('aria-labelledby', `${it.id}-tab`);
    it.sections.forEach((s) => panel.append(s));
    grid.append(panel);
    col.append(grid);
    it.grid = grid;
  });

  block.replaceChildren(col);

  /* state machine — observed live (stardust/replica/motion/products-software*.json) */
  const close = () => {
    mobile.classList.remove('is-open');
    block.classList.remove('is-open');
    mobBtn.setAttribute('aria-expanded', 'false');
  };
  const setTab = (i) => {
    items.forEach((it, k) => {
      it.tab.classList.toggle('is-active', k === i);
      it.btn.setAttribute('aria-selected', k === i ? 'true' : 'false');
      it.btn.tabIndex = k === i ? 0 : -1;
      it.mobLabel.classList.toggle('is-active', k === i);
      it.mobItem.classList.toggle('is-hidden', k === i);
      it.grid.classList.toggle('is-active', k === i);
    });
    close();
  };
  items.forEach((it, i) => {
    it.btn.addEventListener('click', () => setTab(i));
    it.btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTab(i); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const n = (i + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length;
        setTab(n); items[n].btn.focus();
      }
    });
    it.mobItem.addEventListener('click', () => setTab(i));
  });
  mobBtn.addEventListener('click', () => {
    const open = !mobile.classList.contains('is-open');
    mobile.classList.toggle('is-open', open);
    block.classList.toggle('is-open', open);
    mobBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  scrim.addEventListener('click', close);
}
