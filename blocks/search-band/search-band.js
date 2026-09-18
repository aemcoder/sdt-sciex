/**
 * search-band — the green "Everything You Need, Anytime You Need It" search band of /support (live
 * .banner-bottom-search.section-space: lede + portal search form, 62px clip at desktop). Prototype:
 * stardust/prototypes/support-proposed.html `.sn-band`; schema: stardust/eds-schema/support.json §
 * search-band. Decode tier: template-slotted (#95) — fixed composition, authored nodes MOVE.
 *
 * Authoring rows (simple shape):
 *   1. <p>Everything You Need, Anytime You Need It</p>                       the lede (live p.big)
 *   2. <p><a href="https://sciex.com/search-results">Search articles, discussions, FAQs, and
 *      more</a></p> link TEXT = the input placeholder (and its visually-hidden label — the
 *      paragraph
 *      MOVES there, editable); link HREF = the form action. The hidden `source=portal` field is
 *      live
 *      form config.
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

let uid = 0;

export default function decorate(block) {
  const ps = [...block.querySelectorAll('p')];
  const link = block.querySelector('a[href]');
  const lede = ps.find((p) => !p.querySelector('a')) || null;

  const band = el('div', 'sn-band');
  const row = el('div', 'sn-band-row');
  const colLede = el('div', 'sn-band-col');
  if (lede) {
    const wrap = el('div', 'sn-band-lede');
    wrap.append(lede);
    colLede.append(wrap);
  }
  const colSearch = el('div', 'sn-band-col');
  if (link) {
    uid += 1;
    const labelId = `sn-band-label-${uid}`;
    const search = el('div', 'sn-band-search');
    const form = el('form');
    form.action = link.href;
    form.method = 'get';
    form.setAttribute('role', 'search');
    const label = el('div', 'sn-band-label sr-only');
    label.id = labelId;
    label.append(link.closest('p') || link); // MOVE the authored paragraph (EW3)
    const source = el('input');
    source.type = 'hidden';
    source.name = 'source';
    source.value = 'portal';
    const input = el('input', 'sn-band-input');
    input.type = 'text';
    input.name = 'term';
    input.placeholder = link.textContent.trim();
    input.setAttribute('aria-labelledby', labelId);
    const submit = el('button', 'sn-band-submit');
    submit.type = 'submit';
    submit.setAttribute('aria-label', 'Search');
    form.append(label, source, input, submit);
    search.append(form);
    colSearch.append(search);
  }
  row.append(colLede, colSearch);
  band.append(row);
  block.replaceChildren(band);
}
