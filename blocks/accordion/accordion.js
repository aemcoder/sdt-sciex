/**
 * accordion — Block Collection `accordion` content model (ONE ROW PER ITEM, cells label | content),
 * skinned as the live v3 cmp-accordion inside the software "Data processing" tab: ruled rows, a
 * text-lg-bolder label, a chevron that rotates 180° when open, height-animated content, every item
 * OPEN at t=0 (as observed live). Schema: stardust/eds-schema/products-software.json § tabs
 * (accordion: 6 units). Decode tier: reconstructive; authored nodes MOVE (EW1–EW3, EW7, EW9).
 *
 * Authoring:
 *   row: <div><div><p>Quantitative bioanalysis</p></div><div>[prose panel]</div></div>
 *   Rich panels — sections following the block's section carrying section-metadata
 *   `accordion | <Label>` (pipeline: data-accordion="<Label>") are adopted into the item whose
 *   label matches (normalised text); consecutive same-label sections form the panel in authored
 *   order. A row may combine both (prose cell first, then adopted sections). A section whose label
 *   matches no row stays in place — never silently dropped.
 *
 * Editability (EW7): the label <p> moves into a sibling div.acc-label; the whole row head takes
 * the click handler and the <button> is a chevron-only toggle with an aria-label derived from
 * the authored label (attribute only — no rendered words are added).
 */

const CHEV_MOBILE = '<svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17 7.00043L10 14.0004L3 7.00043" stroke="currentColor"></path></svg>';
const CHEV_DESKTOP = '<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20 8L12 16L4 8" stroke="currentColor"></path></svg>';

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function cellNodes(cell) {
  if (!cell) return [];
  const kids = [...cell.children];
  if (kids.length) return kids;
  // HARNESS-ONLY fallback (EW5): move a bare text node into a fresh <p>, never copy it
  if (cell.textContent.trim()) { const p = document.createElement('p'); p.append(...cell.childNodes); return [p]; }
  return [];
}

// the pipeline re-joins comma-bearing metadata values without the space ("Pharma,ADME-Tox"):
// compare labels on their alphanumerics only
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const uid = Math.random().toString(36).slice(2, 7);
  const items = rows.map((row, i) => {
    const cells = [...row.children];
    const labelNodes = cellNodes(cells[0]);
    return {
      id: `acc-${uid}-${i}`, labelNodes, key: norm(labelNodes.map((n) => n.textContent).join(' ')), content: cells.length > 1 ? cellNodes(cells[cells.length - 1]) : [], sections: [],
    };
  });

  // adopt following sibling sections carrying data-accordion
  const section = block.closest('.section') || block.parentElement.parentElement;
  let sib = section ? section.nextElementSibling : null;
  while (sib && sib.dataset && sib.dataset.accordion !== undefined) {
    const next = sib.nextElementSibling;
    const key = norm(sib.dataset.accordion);
    const item = items.find((it) => it.key === key);
    if (item) item.sections.push(sib);
    sib = next;
  }

  const list = el('div', 'acc-list');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  items.forEach((it) => {
    const item = el('div', 'acc-item is-open');
    const row = el('div', 'acc-row');
    const cell = el('div', 'acc-cell');
    const head = el('div', 'acc-head');
    const label = el('div', 'acc-label');
    label.append(...it.labelNodes);
    const btn = el('button', 'acc-toggle');
    btn.type = 'button';
    btn.id = `${it.id}-btn`;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-controls', `${it.id}-panel`);
    btn.setAttribute('aria-label', label.textContent.trim());
    const chev = el('div', 'acc-chev');
    const m = el('div', 'acc-chev-mobile'); m.innerHTML = CHEV_MOBILE;
    const d = el('div', 'acc-chev-desktop'); d.innerHTML = CHEV_DESKTOP;
    chev.append(m, d);
    btn.append(chev);
    head.append(label, btn);
    const content = el('div', 'acc-content');
    content.id = `${it.id}-panel`;
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', btn.id);
    const inner = el('div', 'acc-inner');
    if (it.content.length) { const prose = el('div', 'acc-prose'); prose.append(...it.content); inner.append(prose); }
    it.sections.forEach((s) => inner.append(s));
    content.append(inner);
    cell.append(head, content);
    row.append(cell);
    item.append(row);
    list.append(item);

    /* height animation — observed live (.3s ease-in-out), instant under reduced motion */
    const toggle = () => {
      const open = item.classList.contains('is-open');
      if (reduce.matches) {
        item.classList.toggle('is-open', !open);
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        return;
      }
      if (open) {
        content.style.height = `${content.scrollHeight}px`;
        item.classList.add('is-closing');
        requestAnimationFrame(() => { content.style.height = '0px'; });
        content.addEventListener('transitionend', function h() {
          content.removeEventListener('transitionend', h);
          item.classList.remove('is-open', 'is-closing');
          content.style.height = '';
        });
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        item.classList.remove('is-closing');
        const target = content.scrollHeight;
        content.style.height = '0px';
        requestAnimationFrame(() => { content.style.height = `${target}px`; });
        content.addEventListener('transitionend', function h() {
          content.removeEventListener('transitionend', h);
          content.style.height = '';
        });
        btn.setAttribute('aria-expanded', 'true');
      }
    };
    head.addEventListener('click', (e) => {
      // link navigation inside a label is not a toggle
      if (e.target.closest('a')) return;
      toggle();
    });
    head.addEventListener('keydown', (e) => {
      if (e.target === btn) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
  block.replaceChildren(list);
}
