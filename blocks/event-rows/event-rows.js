/**
 * event-rows — live v3 `.events-row` (/applications/environmental-testing "Events and webinars"):
 * a ruled head and one ruled row per event; the WHOLE ROW is a link (thumb 3/12 | status + play
 * icon 1/4 of 7/12 | kicker + title 3/4 | "Watch now" 2/12).
 * Prototype: stardust/prototypes/applications-environmental-testing-proposed.html `section.events`;
 * schema: stardust/eds-schema/applications-environmental-testing.json § events (3 units).
 * Decode tier: reconstructive (authors add/remove events); every authored node MOVES (EW1–EW3);
 * the row link is built from the CTA's href and the inner anchor is unwrapped in the live DOM
 * (card-as-link, EW6 — the indexed <p> survives inside the row <a>).
 *
 * Authoring — the head (<h2>) is DEFAULT CONTENT before the block (D1; reabsorbed into the ruled
 * head row, EW8), then ONE ROW PER EVENT, cells thumb | meta + title | CTA:
 *   <h2>Events and webinars</h2>                                        (default content)
 *   <div class="event-rows">
 *     <div>
 *       <div><p><img src="https://content.da.live/…/media/applications/events-enviro-icon_192x144-w1920.webp" alt=""></p></div>
 *       <div><p>On demand</p><p>Webinar</p><h3>PFAS summit: a scientific series …</h3></div>
 *       <div><p><em><a href="https://sciex.com/Hidden/landing-pages/on-demand-pfas-summit-2023">
 *            Watch now</a></em></p></div>
 *     </div>
 *     …
 *   </div>
 * Meta cell order: the FIRST paragraph is the status ("On demand"), the rest (kicker paragraph(s) +
 * the <h3> title) keep their authored order. The play icon is the same on every live row, so it is
 * a presentational CSS element (no words added by decorate()). Hover: dead on live (not
 * implemented).
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

const isMedia = (n) => n.matches('picture, img') || !!n.querySelector('picture, img');
const isCta = (n) => !isMedia(n) && !!n.querySelector('a');

function cellNodes(cell) {
  const kids = [...cell.children];
  if (kids.length) return kids;
  if (cell.textContent.trim()) { const p = el('p'); p.append(...cell.childNodes); return [p]; }
  return [];
}

function sectionHead(block) {
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  return prev && prev.classList.contains('default-content-wrapper') ? prev : null;
}

function buildRow(row) {
  const nodes = [...row.children].flatMap(cellNodes);
  const media = nodes.find(isMedia) || null;
  const ctas = nodes.filter((n) => n !== media && isCta(n));
  const texts = nodes.filter((n) => n !== media && !ctas.includes(n));
  if (!media && !texts.length && !ctas.length) return null;

  const link = ctas.length ? ctas[ctas.length - 1].querySelector('a') : null;
  const item = el(link ? 'a' : 'div', 'event-item');
  if (link) {
    item.href = link.href;
    if (link.target) item.target = link.target;
  }

  const thumbCol = el('div', 'event-thumb-col');
  if (media) {
    const thumb = el('div', 'event-thumb');
    const pic = media.matches('picture, img') ? media : media.querySelector('picture, img');
    thumb.append(pic);
    thumbCol.append(thumb);
  }
  item.append(thumbCol);

  const mid = el('div', 'event-mid');
  const meta = el('div', 'event-meta');
  const body = el('div', 'event-body');
  const status = texts.find((t) => t.tagName === 'P') || null;
  if (status) meta.append(status);
  meta.append(el('div', 'event-icon')); // presentational play badge (live: identical svg on every row)
  texts.filter((t) => t !== status).forEach((t) => body.append(t));
  mid.append(meta, body);
  item.append(mid);

  const cta = el('div', 'event-cta');
  ctas.forEach((c) => {
    const par = c.matches('p') ? c : c.closest('p') || c;
    cta.append(par);
    // EW6: the row is the link — unwrap the authored inner anchors in the live DOM
    par.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
  });
  item.append(cta);
  return item;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const container = el('div', 'container');
  const head = sectionHead(block);
  if (head) {
    const h = el('div', 'event-head');
    h.append(...head.childNodes);
    head.remove();
    container.append(h);
  }
  const items = rows.map(buildRow).filter(Boolean);
  items.forEach((item, i) => {
    const r = el('div', 'event-row');
    if (i === items.length - 1) r.classList.add('event-row-last');
    r.append(item);
    container.append(r);
  });
  block.replaceChildren(container);
}
