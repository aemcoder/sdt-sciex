/**
 * cards — every repeating card grid on the site, one canonical block + variant classes
 * (D9/D11, Block Collection `cards` content model: ONE ROW PER CARD, cells image | body).
 * Schema: stardust/eds-schema/index.json § promo-tiles (2 units), product-cards (3),
 * why-sciex-applications (7), stories (2). Decode tier: reconstructive (authors add/remove
 * cards); all authored nodes MOVE into the card template (EW1–EW3, EW6, EW8).
 *
 * Variants (block class):
 *   cards promo     — live .media-grid: 2-up linked image tiles. Row = one cell holding a
 *                     linked image: <a href="…"><img alt="…"></a>
 *   cards products  — live .three-card: 3-up product cards. Row = picture | body
 *                     (<h3>title</h3><p>text</p>…<p><em><a>Explore now</a></em></p>)
 *   cards icons     — live .icon-4-col: 7 icon cards, 4 per row. Row = icon | body
 *                     (icon cell = :app-icon-name: EDS icon, body as above)
 *   cards stories   — live .media-card-carousel: 2-up story cards, Splide rail below 768.
 *                     Row = picture | body. The pagination "1 / 2" is generated
 *                     (allowlisted runtime numerals, mobile-only controls).
 *   cards image     — live .image-card (pharma landing #B): 7 application cards, 1/2/4-up
 *                     grid, head (h2 + lede) reabsorbed into a bordered head row. Row =
 *                     picture | body (<h3>title</h3><p>text</p><p><em><a>Learn more</a></em></p>).
 *                     Schema: stardust/eds-schema/applications-pharma-and-biopharma.json
 *                     § applications.
 *   cards stories three-up — modifier: live .image-card-carousel perPage 3 (pharma "Thought
 *                     leaders"): 3-up at ≥1024, t-charlie title; same rail mechanics.
 * Section head (h2 [+ lede]) is DEFAULT CONTENT before the block (D1); `icons` and
 * `stories` reabsorb it by MOVING the wrapper's children (EW8), the others leave it alone.
 * Link text of the CTA doubles as the media link's aria-label (attribute, not rendered text).
 */

const ARROW_PREV = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 14.0037L4 8.00366L10 2.00366" stroke="currentColor"></path></svg>';
const ARROW_NEXT = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 2.00366L12 8.00366L6 14.0037" stroke="currentColor"></path></svg>';

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

// Every authored element of a row as flat siblings (cells may be bare text — HARNESS-ONLY
// fallback, EW5 — or hold several elements).
function rowNodes(row) {
  const out = [];
  [...row.children].forEach((cell) => {
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
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) { const p = document.createElement('p'); p.append(...cell.childNodes); out.push(p); }
  });
  return out;
}

const isMedia = (n) => n.matches('picture, img') || !!n.querySelector('picture, img');
const isIcon = (n) => n.matches('span.icon') || !!n.querySelector('span.icon');
const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const isCta = (n) => !isMedia(n) && !!n.querySelector('a');

function classify(row) {
  const nodes = rowNodes(row);
  // icons first: decorateIcons() puts an <img> INSIDE span.icon, so an icon cell also
  // matches the media test
  const icon = nodes.find(isIcon) || null;
  const media = nodes.find((n) => n !== icon && isMedia(n)) || null;
  const heading = nodes.find(isHeading) || null;
  const ctas = nodes.filter((n) => n !== media && n !== icon && !isHeading(n) && isCta(n));
  const texts = nodes.filter((n) => n !== media && n !== icon && n !== heading
    && !ctas.includes(n));
  const link = media ? (media.matches('a') ? media : media.querySelector('a')) || media.closest('a') : null;
  return {
    media, icon, heading, ctas, texts, link,
  };
}

// The section's leading default-content wrapper (the block is nested in .cards-wrapper).
function sectionHead(block) {
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  return prev && prev.classList.contains('default-content-wrapper') ? prev : null;
}

function mediaLink(card) {
  const cta = card.ctas[0] && card.ctas[0].querySelector('a');
  const a = el('a');
  if (cta) {
    a.href = cta.href;
    if (cta.target) a.target = cta.target;
    a.setAttribute('aria-label', cta.textContent.trim());
  }
  return a;
}

/* ---------- promo: 2-up linked image tiles ---------- */
function decoratePromo(block, cards) {
  const container = el('div', 'container');
  const row = el('div', 'media-grid-row');
  cards.forEach((card) => {
    const item = el('div', 'media-grid-item');
    const box = el('div', 'media-grid-box');
    const pic = card.media.matches('picture, img') ? card.media : card.media.querySelector('picture, img');
    let { link } = card;
    if (!link && card.ctas[0]) link = mediaLink(card);
    if (link) {
      item.append(link);
      link.replaceChildren(box);
    } else item.append(box);
    box.append(pic);
    card.texts.forEach((t) => item.append(t));
    card.ctas.forEach((c) => { if (c.querySelector('a') !== link) item.append(c); });
    row.append(item);
  });
  container.append(row);
  block.replaceChildren(container);
}

/* ---------- generic media card (products, stories) ---------- */
function buildCard(card, tag = 'div') {
  const node = el(tag, 'card');
  if (card.media) {
    const mediaWrap = el('div', 'card-media');
    const pic = card.media.matches('picture, img') ? card.media : card.media.querySelector('picture, img');
    const a = mediaLink(card);
    a.append(pic);
    mediaWrap.append(a);
    node.append(mediaWrap);
  }
  const body = el('div', 'card-body');
  if (card.heading) { const t = el('div', 'card-title'); t.append(card.heading); body.append(t); }
  if (card.texts.length) { const t = el('div', 'card-text'); t.append(...card.texts); body.append(t); }
  card.ctas.forEach((c) => body.append(c));
  node.append(body);
  return node;
}

function decorateProducts(block, cards) {
  const container = el('div', 'container');
  const grid = el('div', 'three-card-grid');
  cards.forEach((card) => grid.append(buildCard(card)));
  container.append(grid);
  block.replaceChildren(container);
}

/* ---------- icons: 7 icon cards, head reabsorbed ---------- */
function decorateIcons(block, cards) {
  const container = el('div', 'container');
  const head = sectionHead(block);
  if (head) {
    const h = el('div', 'icon-grid-head');
    h.append(...head.childNodes);
    head.remove();
    container.append(h);
  }
  const grid = el('div', 'icon-grid-grid');
  cards.forEach((card) => {
    const node = el('div', 'icon-card');
    if (card.icon) {
      const i = el('div', 'icon-card-icon');
      i.append(card.icon);
      node.append(i);
    }
    if (card.heading) { const t = el('div', 'icon-card-title'); t.append(card.heading); node.append(t); }
    if (card.texts.length) { const t = el('div', 'icon-card-text'); t.append(...card.texts); node.append(t); }
    if (card.ctas.length) { const l = el('div', 'icon-card-link'); l.append(...card.ctas); node.append(l); }
    grid.append(node);
  });
  container.append(grid);
  block.replaceChildren(container);
}

/* ---------- stories: 2-up cards, Splide-style rail when the slides overflow ---------- */
function decorateStories(block, cards) {
  const container = el('div', 'container');
  const track = el('div', 'stories-track');
  const headRow = el('div');
  const head = el('div', 'stories-head');
  const titleWrap = el('div', 'stories-title-wrap');
  const authoredHead = sectionHead(block);
  if (authoredHead) { titleWrap.append(...authoredHead.childNodes); authoredHead.remove(); }
  const controls = el('div', 'stories-controls');
  head.append(titleWrap, controls);
  headRow.append(head);
  const list = el('ul', 'stories-list');
  list.setAttribute('role', 'presentation');
  cards.forEach((card, i) => {
    const li = buildCard(card, 'li');
    li.classList.add('stories-slide');
    li.setAttribute('role', 'tabpanel');
    li.setAttribute('aria-label', `${i + 1} of ${cards.length}`);
    list.append(li);
  });
  track.append(headRow, list);
  container.append(track);
  block.replaceChildren(container);

  /* rail mechanics — observed live (interaction-spec § Home-only widgets) */
  const slides = list.children;
  let index = 0;
  const gap = () => parseFloat(getComputedStyle(slides[0]).marginRight) || 0;
  const pitch = () => slides[0].getBoundingClientRect().width + gap();
  const overflow = () => (pitch() * slides.length - gap()) > list.getBoundingClientRect().width + 1;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const setSlideClasses = () => {
    [...slides].forEach((s, k) => {
      s.classList.toggle('is-active', k === index);
      s.classList.toggle('is-visible', k === index || !overflow());
      s.classList.toggle('is-prev', k === index - 1);
      s.classList.toggle('is-next', k === index + 1);
    });
  };
  let go;
  const paint = (animate) => {
    const over = overflow();
    block.classList.toggle('is-overflow', over);
    if (!over) {
      controls.replaceChildren(); index = 0; list.style.transition = ''; list.style.transform = 'translateX(0px)'; setSlideClasses(); return;
    }
    if (!controls.firstChild) {
      const inner = el('div', 'stories-controls-inner');
      const arrows = el('div', 'stories-arrows');
      const prev = el('button', 'stories-arrow stories-arrow-prev');
      prev.type = 'button'; prev.setAttribute('aria-label', 'Previous slide'); prev.innerHTML = ARROW_PREV;
      const next = el('button', 'stories-arrow stories-arrow-next');
      next.type = 'button'; next.setAttribute('aria-label', 'Next slide'); next.innerHTML = ARROW_NEXT;
      const pag = el('ul', 'stories-pagination');
      pag.setAttribute('role', 'tablist'); pag.setAttribute('aria-label', 'Select a slide to show');
      [...slides].forEach((s, k) => {
        const li = el('li'); li.setAttribute('role', 'presentation');
        const b = el('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', `Go to slide ${k + 1}`); b.tabIndex = -1; b.setAttribute('aria-hidden', 'true');
        b.textContent = k < slides.length - 1 ? `${k + 1}\u00a0/\u00a0` : `${k + 1}`;
        b.addEventListener('click', () => go(k));
        li.append(b); pag.append(li);
      });
      prev.addEventListener('click', () => go(index - 1));
      next.addEventListener('click', () => go(index + 1));
      arrows.append(prev, pag, next);
      inner.append(arrows);
      controls.append(inner);
    }
    controls.querySelector('.stories-arrow-prev').disabled = index <= 0;
    controls.querySelector('.stories-arrow-next').disabled = index >= slides.length - 1;
    controls.querySelectorAll('.stories-pagination button').forEach((b, k) => { b.classList.toggle('is-active', k === index); b.setAttribute('aria-selected', k === index ? 'true' : 'false'); });
    list.style.transition = animate && !reduce.matches ? 'transform 600ms ease-in-out' : '';
    list.style.transform = `translateX(${-index * pitch()}px)`;
    setSlideClasses();
  };
  go = (i) => { index = Math.max(0, Math.min(slides.length - 1, i)); paint(true); };
  paint(false);
  window.addEventListener('resize', () => paint(false));
  window.addEventListener('load', () => paint(false));
  /* EDS decorates before blocks/cards/cards.css has necessarily applied and often after
     window.load has already fired, so the first paint can see full-width slides and wrongly
     mount the controls at desktop. Re-measure whenever the list or a slide is resized
     (fires once the block CSS lands) and on the next frames. */
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => paint(false));
    ro.observe(list); ro.observe(slides[0]);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => paint(false)));
}

/* ---------- image: application cards, 1/2/4-up grid, head reabsorbed (EW8) ---------- */
function decorateImage(block, cards) {
  const container = el('div', 'container');
  const head = sectionHead(block);
  if (head) {
    const h = el('div', 'image-grid-head');
    h.append(...head.childNodes);
    head.remove();
    container.append(h);
  }
  const grid = el('div', 'image-grid');
  cards.forEach((card) => grid.append(buildCard(card)));
  container.append(grid);
  block.replaceChildren(container);
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const cards = rows.map(classify);
  if (block.classList.contains('promo')) decoratePromo(block, cards.filter((c) => c.media));
  else if (block.classList.contains('icons')) decorateIcons(block, cards);
  else if (block.classList.contains('stories')) decorateStories(block, cards);
  else if (block.classList.contains('image')) decorateImage(block, cards);
  else decorateProducts(block, cards);
}
