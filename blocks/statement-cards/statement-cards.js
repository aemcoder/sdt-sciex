/**
 * statement-cards — live v3 `.statement-3-card` (/applications/biomedical-and-omics-research
 * "Thought leaders"): a rotated vertical statement word in the first grid cell + one card per
 * following cell (picture, title, text, arrow link), 1 → 3 columns at 768.
 * Prototype: stardust/prototypes/applications-biomedical-and-omics-research-proposed.html
 * `section.statement`; schema: stardust/eds-schema/applications-biomedical-and-omics-research.json
 * § statement-3-card (2 card units + the word). Decode tier: reconstructive (authors add/remove
 * cards); every authored node MOVES (EW1–EW3, EW6, EW8).
 *
 * Authoring — the statement word is DEFAULT CONTENT before the block (D1 section head; the
 * block reabsorbs it into the grid's first cell, EW8), then ONE ROW PER CARD, cells picture | body:
 *   <h2>Thought leaders</h2>                                   (default content, same section)
 *   <div class="statement-cards">
 *     <div>
 *       <div><p><img src="https://content.da.live/…/media/applications/extraordinary-science.jpg"
 *                    alt=""></p></div>
 *       <div><h3>Extraordinary science</h3><p>Step into …</p>
 *            <p><em><a href="/applications/biomedical-and-omics-research/extraordinary-science"
 *                       target="_blank">Learn more</a></em></p></div>
 *     </div>
 *     …
 *   </div>
 * Defensive decode: a leading row with no picture whose content is a heading is read as the
 * word (old in-table head). The rotated two-line word is pure CSS on the wrapper
 * (writing-mode + rotate + min-content height) — no per-word spans, so the editor swap changes
 * nothing. No words are added by decorate(); the card image link's aria-label repeats the CTA
 * text (attribute only).
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function wrapNode(node, className) {
  const w = el('div', className);
  w.append(node);
  return w;
}

const isMedia = (n) => n.matches('picture, img') || !!n.querySelector('picture, img');
const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const isCta = (n) => !isMedia(n) && !!n.querySelector('a');

// Every authored element of a cell as flat siblings (a bare-text cell — harness-only — is wrapped).
function cellNodes(cell) {
  const kids = [...cell.children];
  if (kids.length) return kids;
  if (cell.textContent.trim()) { const p = el('p'); p.append(...cell.childNodes); return [p]; }
  return [];
}

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

function sectionHead(block) {
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  return prev && prev.classList.contains('default-content-wrapper') ? prev : null;
}

function buildWord(nodes) {
  const item = el('div', 'statement-item statement-item-word');
  const word = el('div', 'statement-word');
  const rot = el('div', 'statement-rot');
  rot.append(...nodes);
  word.append(rot);
  item.append(word);
  return item;
}

function buildCard(card) {
  const item = el('div', 'statement-item statement-card');
  const cta = card.ctas.length ? card.ctas[card.ctas.length - 1].querySelector('a') : null;
  if (card.media) {
    const mediaWrap = el('div', 'statement-media');
    const pic = card.media.matches('picture, img') ? card.media : card.media.querySelector('picture, img');
    if (cta) {
      const a = el('a');
      a.href = cta.href;
      if (cta.target) a.target = cta.target;
      // presentational link around the picture (no words): the CTA text names it for AT
      a.setAttribute('aria-label', cta.textContent.trim());
      a.append(pic);
      mediaWrap.append(a);
    } else {
      mediaWrap.append(pic);
    }
    item.append(mediaWrap);
  }
  const body = el('div', 'statement-body');
  if (card.heading) body.append(wrapNode(card.heading, 'statement-title'));
  if (card.texts.length) { const t = el('div', 'statement-text'); t.append(...card.texts); body.append(t); }
  card.ctas.forEach((c) => body.append(wrapNode(c, 'statement-cta')));
  item.append(body);
  return item;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const cards = rows.map(classify);
  const container = el('div', 'container');
  const grid = el('div', 'statement-grid');

  // the statement word: default content before the block (EW8) — else a leading heading-only row
  const head = sectionHead(block);
  if (head) {
    grid.append(buildWord([...head.childNodes]));
    head.remove();
  } else if (cards.length && !cards[0].media && cards[0].heading && !cards[0].ctas.length) {
    const first = cards.shift();
    grid.append(buildWord([first.heading, ...first.texts]));
  }

  cards.filter((c) => c.media || c.heading || c.texts.length)
    .forEach((card) => grid.append(buildCard(card)));
  if (grid.lastElementChild) grid.lastElementChild.classList.add('statement-item-last');
  container.append(grid);
  block.replaceChildren(container);
}
