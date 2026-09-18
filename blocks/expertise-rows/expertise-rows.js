/**
 * expertise-rows — live legacy `2x2-list` (#related on /support/professional-lab-services, the
 * page-content template): a ruled head (h4 + empty span) over a 2-column grid of rows, each row =
 * 1/3 picture | title, paragraph, bold blue "Learn more" link, rows ruled on top. A row LIST with a
 * side image at legacy type — not the v3 `cards` grid pattern, hence its own name (brief).
 * Schema: stardust/eds-schema/support-professional-lab-services.json § areas-of-expertise
 * (5 units).
 * Decode tier: reconstructive (authors add/remove rows); every authored node MOVES (EW1–EW3, EW8).
 *
 * Authoring:
 *   section default content before the block: <h2>Our areas of expertise</h2>   (reabsorbed, EW8)
 *   ONE ROW PER ITEM, cells picture | body:
 *   <div>
 *     <div><p><img src="https://content.da.live/…/media/about-support/expertise-software-it.jpg" alt="…"></p></div>
 *     <div><h3>Software and IT services</h3>
 *          <p>Integrating and optimizing the technology in your lab …</p>
 *          <p><em><a href="https://sciex.com/support/professional-lab-services/software-and-it" target="_blank">Learn more</a></em></p></div>
 *   </div>
 * No words are added by decorate(); the live empty <span> beside the head is not authored.
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

// Every authored element of a cell as flat siblings (#104; bare text → <p>, harness-only, EW5).
function cellNodes(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img') && kids[0].childNodes.length > 1) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      if (n.textContent.trim()) { const p = el('p'); p.append(n); return p; }
      return null;
    }).filter(Boolean);
  }
  if (kids.length) return kids;
  if (cell.textContent.trim()) { const p = el('p'); p.append(...cell.childNodes); return [p]; }
  return [];
}

const isMedia = (n) => n.matches('picture, img') || !!n.querySelector('picture, img');
const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const isCta = (n) => !isMedia(n) && !!n.querySelector('a');

function classify(row) {
  const nodes = [...row.children].flatMap(cellNodes);
  const media = nodes.find(isMedia) || null;
  const heading = nodes.find(isHeading) || null;
  const ctas = nodes.filter((n) => n !== media && !isHeading(n) && isCta(n));
  const texts = nodes.filter((n) => n !== media && n !== heading && !ctas.includes(n));
  return {
    media, heading, ctas, texts,
  };
}

// The section's leading default-content wrapper (the block is nested in .expertise-rows-wrapper).
function sectionHead(block) {
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  return prev && prev.classList.contains('default-content-wrapper') ? prev : null;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const items = rows.map(classify);

  const container = el('div', 'container');
  const head = sectionHead(block);
  if (head) {
    const h = el('div', 'xrows-head');
    const title = el('div', 'xrows-title');
    title.append(...head.childNodes);
    head.remove();
    h.append(title);
    container.append(h);
  }
  const grid = el('div', 'xrows-grid');
  items.forEach((item) => {
    const cell = el('div', 'xrows-cell');
    const node = el('div', 'xrows-item');
    if (item.media) {
      const m = el('div', 'xrows-media');
      const pic = item.media.matches('picture, img') ? item.media : item.media.querySelector('picture, img');
      m.append(pic);
      node.append(m);
    }
    const body = el('div', 'xrows-body');
    if (item.heading) { const t = el('div', 'xrows-heading'); t.append(item.heading); body.append(t); }
    if (item.texts.length) { const t = el('div', 'xrows-text'); t.append(...item.texts); body.append(t); }
    item.ctas.forEach((c) => body.append(c));
    node.append(body);
    cell.append(node);
    grid.append(cell);
  });
  container.append(grid);
  block.replaceChildren(container);
}
