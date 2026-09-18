/**
 * support-shell — the SCIEX Now shell of /support (live header.u-header + aside.sidebar-wrapper):
 * brand bar (logo + sidebar toggler, fixed once scrolled past), 292px sidebar with the online-help
 * search, the Get Help button and N nav groups (header + glyph links). Prototype:
 * stardust/prototypes/support-proposed.html `.sn-bar` + `.sn-side`; schema:
 * stardust/eds-schema/support.json § support-shell. Decode tier: template-slotted for the fixed
 * rows (brand / search / help), reconstructive for the nav groups (one row per group, authors
 * add/remove). Layout: the block's section floats left as the sidebar column; `body.sciex-now main`
 * (styles.css § template sciex-now) gives every other section the body column.
 *
 * Authoring rows (container shape):
 *   1. brand   — one cell: <a href="/support"><img alt="SCIEX Now"></a>  (linked logo)
 *   2. search  — one cell: <p><a href="https://sciex.com/search-results">Search online
 *      help...</a></p> the link TEXT is the input placeholder (and its visually-hidden label), the
 *      HREF is the form action; the authored paragraph MOVES into the label wrapper (editable).
 *   3. help    — one cell: <p><strong><a href="#getHelpModal">Get Help</a></strong></p> (the live
 *      Magnific modal is decided-out, X-01 — the anchor stays as live renders it)
 *   4..N. nav group — two cells: <p>My Lab</p> | <ul><li><a href>…</a></li>…</ul> label MOVES into
 *         .sn-nav-header, the <ul> MOVES whole (one editable unit); the pie-chart and angle-right
 *         glyphs
 *         are ::before/::after CSS content on the authored <a> (no inner spans, so the editor's
 *         span-less
 *         re-render keeps every row's geometry).
 *
 * Interaction parity (stardust/replica/motion/support.json): `.stuck` on the bar once scrollY > 82
 * (position fixed, no animation); toggler click → main.sn-mini (sidebar 292 → 50, labels collapse).
 * Rows are classified by shape, not position: picture → brand; two cells with a <ul> → nav group;
 * the remaining link rows → search (href contains "search", else first) and help.
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function glyph(name) {
  const i = el('i', `hs-admin-${name}`);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

let uid = 0;

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  let brandRow = null;
  const groupRows = [];
  const linkRows = [];
  rows.forEach((row) => {
    if (!brandRow && row.querySelector('picture, img')) brandRow = row;
    else if (row.children.length >= 2 && row.querySelector('ul, ol')) groupRows.push(row);
    else if (row.querySelector('a[href]')) linkRows.push(row);
  });
  const searchRow = linkRows.find((r) => /search/i.test(r.querySelector('a').getAttribute('href') || '')) || linkRows[0] || null;
  const helpRow = linkRows.find((r) => r !== searchRow) || null;

  // ── brand bar (live header.u-header) ──
  const bar = el('div', 'sn-bar');
  const barSection = el('div', 'sn-bar-section');
  const barNav = el('nav', 'sn-bar-nav');
  barNav.setAttribute('aria-label', 'SCIEX Now');
  const brandBox = el('div', 'sn-bar-brand-box');
  const brand = el('div', 'sn-bar-brand');
  if (brandRow) {
    const pic = brandRow.querySelector('picture, img');
    const link = pic.closest('a');
    brand.append(pic.closest('p') || link || pic);
  }
  const toggler = el('button', 'sn-bar-toggler');
  toggler.type = 'button';
  toggler.setAttribute('aria-label', 'Toggle sidebar');
  toggler.setAttribute('aria-expanded', 'true');
  toggler.append(glyph('align-left'));
  brandBox.append(brand, toggler);
  barNav.append(brandBox);
  barSection.append(barNav);
  bar.append(barSection);

  // ── sidebar ──
  const side = el('div', 'sn-side');
  const inner = el('div');
  const search = el('div', 'sn-search');
  if (searchRow) {
    const link = searchRow.querySelector('a[href]');
    const form = el('form', 'sn-search-form');
    form.action = link.href;
    form.method = 'get';
    form.setAttribute('role', 'search');
    uid += 1;
    const labelId = `sn-search-label-${uid}`;
    const label = el('div', 'sn-search-label sr-only');
    label.id = labelId;
    label.append(link.closest('p') || link); // MOVE the authored paragraph (EW3)
    const group = el('div', 'sn-search-group');
    const input = el('input', 'sn-search-input');
    input.type = 'text';
    input.name = 'term';
    input.placeholder = link.textContent.trim();
    input.setAttribute('aria-labelledby', labelId);
    const btn = el('button', 'sn-search-btn');
    btn.type = 'submit';
    btn.setAttribute('aria-label', 'Search');
    btn.append(glyph('search'));
    group.append(input, btn);
    form.append(label, group);
    search.append(form);
  }
  if (helpRow) {
    const help = el('div', 'sn-help');
    const link = helpRow.querySelector('a[href]');
    help.append(link.closest('p') || link);
    search.append(help);
  }
  inner.append(search);

  groupRows.forEach((row) => {
    const cells = [...row.children];
    const list = row.querySelector('ul, ol');
    const labelCell = cells.find((c) => !c.contains(list));
    const nav = el('div', 'sn-nav');
    if (labelCell) {
      const header = el('div', 'sn-nav-header');
      header.append(...labelCell.childNodes);
      nav.append(header);
    }
    nav.append(list);
    inner.append(nav);
  });
  side.append(inner);

  block.replaceChildren(bar, side);

  // ── state: stuck bar + mini sidebar (no motion, so prefers-reduced-motion needs no branch) ──
  const onScroll = () => bar.classList.toggle('stuck', window.scrollY > 82);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const main = block.closest('main');
  toggler.addEventListener('click', () => {
    const mini = main ? main.classList.toggle('sn-mini') : false;
    toggler.setAttribute('aria-expanded', mini ? 'false' : 'true');
  });
}
