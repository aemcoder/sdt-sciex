/**
 * carousel — slide carousel, Block Collection `carousel` content model (ONE ROW PER SLIDE,
 * cells image | content). Variant:
 *   carousel quotes — live .c016-testimonial ("Perspectives"): dark grey-900 band, Splide FADE
 *                     between quote slides (opacity .4s cubic-bezier(.25,1,.5,1)), portrait +
 *                     name/role meta column, prev/next arrows with "N / total" pagination,
 *                     arrows disabled at the ends (no loop, no autoplay — as observed on live).
 * Schema: stardust/eds-schema/applications-pharma-and-biopharma.json § perspectives (3 units:
 * quote, name, role + portrait). Decode tier: reconstructive — every authored node MOVES into
 * the slide template (EW1–EW3); the eyebrow ("Perspectives") is DEFAULT CONTENT before the block
 * that the block reabsorbs into the band (EW8) because the prototype paints it inside the band.
 *
 * Authoring (one row per quote):
 *   <div>
 *     <div><p><img src="https://content.da.live/…/media/applications/shane-karnik.webp" alt=""></p></div>
 *     <div>
 *       <p>"You can theorize all you want, …"</p>              quote (first paragraph)
 *       <p><strong>Shane Karnik</strong></p>                    name — leading <strong>
 *       <p>Senior Lab Director, Aliri Bioanalysis</p>          role
 *     </div>
 *   </div>
 * Defensive decode: without a <strong>, paragraphs are read positionally (quote, name, role);
 * a missing portrait leaves the meta column text-only.
 *
 * Generated text: pagination numerals "1 / " … "3" (runtime values, allowlisted; mirrors live).
 */

const ARROW_PREV = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 14.0037L4 8.00366L10 2.00366" stroke="currentColor"></path></svg>';
const ARROW_NEXT = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 14.0037L11 8.00366L5 2.00366" stroke="currentColor"></path></svg>';

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

// Every authored element of a cell as flat siblings (#104 — expand a media-led cell the
// runtime folded into one <p>; bare text → <p>, HARNESS-ONLY fallback, EW5).
function cellNodes(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img')) {
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

function classify(row) {
  const nodes = [...row.children].flatMap(cellNodes);
  const media = nodes.find(isMedia) || null;
  const texts = nodes.filter((n) => n !== media && n.textContent.trim());
  let name = texts.find((n) => n.querySelector(':scope > strong:only-child, :scope > b:only-child')) || null;
  let quote = texts.find((n) => n !== name) || null;
  const rest = texts.filter((n) => n !== name && n !== quote);
  if (!name && rest.length) { [name] = rest; rest.shift(); }
  if (!quote) quote = null;
  return {
    media, quote, name, roles: rest,
  };
}

// The section's leading default-content wrapper (the block is nested in .carousel-wrapper).
function sectionHead(block) {
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  return prev && prev.classList.contains('default-content-wrapper') ? prev : null;
}

function buildSlide(item, i, total, idBase) {
  const li = el('li', 'carousel-slide');
  li.id = `${idBase}-slide${String(i + 1).padStart(2, '0')}`;
  li.setAttribute('role', 'tabpanel');
  li.setAttribute('aria-roledescription', 'slide');
  li.setAttribute('aria-label', `${i + 1} of ${total}`);
  li.style.transform = `translateX(${-i * 100}%)`;
  const row = el('div', 'quote-row');
  const col = el('div', 'quote-col');
  const inner = el('div', 'quote-inner');
  if (item.quote) inner.append(wrapNode(item.quote, 'quote-text'));
  col.append(inner);
  row.append(col);
  const meta = el('div', 'quote-meta');
  if (item.media) {
    const media = item.media.matches('picture, img') ? item.media : item.media;
    meta.append(wrapNode(media, 'quote-portrait'));
  }
  const who = el('div', 'quote-who');
  if (item.name) who.append(wrapNode(item.name, 'quote-name'));
  item.roles.forEach((r) => who.append(wrapNode(r, 'quote-role')));
  meta.append(who);
  row.append(meta);
  li.append(row);
  return li;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const items = rows.map(classify).filter((it) => it.quote || it.media);
  const idBase = `carousel-${Math.random().toString(36).slice(2, 7)}`;

  const dark = el('div', 'carousel-dark');
  const container = el('div', 'container');
  const track = el('div', 'carousel-track');
  track.id = `${idBase}-track`;
  track.setAttribute('aria-live', 'polite');
  track.setAttribute('aria-atomic', 'true');

  const head = sectionHead(block);
  if (head) {
    const eyebrow = el('div', 'carousel-eyebrow');
    eyebrow.append(...head.childNodes);
    head.remove();
    track.append(eyebrow);
  }

  const list = el('ul', 'carousel-list');
  list.setAttribute('role', 'presentation');
  items.forEach((it, i) => list.append(buildSlide(it, i, items.length, idBase)));
  track.append(list);
  container.append(track);

  /* controls — live Splide UI: prev · "N / total" pagination · next */
  const controls = el('div', 'carousel-controls');
  const arrows = el('div', 'carousel-arrows');
  const prev = el('button', 'carousel-arrow carousel-arrow-prev');
  prev.type = 'button'; prev.setAttribute('aria-label', 'Previous slide'); prev.setAttribute('aria-controls', track.id); prev.innerHTML = ARROW_PREV;
  const next = el('button', 'carousel-arrow carousel-arrow-next');
  next.type = 'button'; next.setAttribute('aria-label', 'Next slide'); next.setAttribute('aria-controls', track.id); next.innerHTML = ARROW_NEXT;
  const pag = el('ul', 'carousel-pagination');
  pag.setAttribute('role', 'tablist'); pag.setAttribute('aria-label', 'Select a slide to show');
  const slides = [...list.children];
  slides.forEach((s, k) => {
    const li = el('li'); li.setAttribute('role', 'presentation');
    const b = el('button'); b.type = 'button'; b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', s.id); b.setAttribute('aria-label', `Go to slide ${k + 1}`);
    b.tabIndex = -1; b.setAttribute('aria-hidden', 'true');
    li.append(b); pag.append(li);
  });
  arrows.append(prev, pag, next);
  controls.append(arrows);
  container.append(controls);
  dark.append(container);
  block.replaceChildren(dark);

  /* fade state machine — same classes/durations as live */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  const paginate = () => {
    [...pag.querySelectorAll('button')].forEach((b, k) => {
      const total = slides.length;
      let label = '';
      if (k === 0) label = `${index + 1}\u00a0/\u00a0`;
      else if (k === total - 1) label = String(total);
      b.textContent = label;
      b.classList.toggle('is-active', k === index);
      b.setAttribute('aria-selected', k === index ? 'true' : 'false');
    });
  };
  const paint = (animate) => {
    slides.forEach((s, k) => {
      if (animate && !reduce.matches) s.classList.add('is-fading');
      s.classList.toggle('is-prev', k === index - 1);
      s.classList.toggle('is-next', k === index + 1);
      s.classList.toggle('is-active', k === index);
      s.classList.toggle('is-visible', k === index);
      if (k === index) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
    });
    prev.disabled = index <= 0;
    next.disabled = index >= slides.length - 1;
    paginate();
  };
  const go = (i) => { index = Math.max(0, Math.min(slides.length - 1, i)); paint(true); };
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  [...pag.querySelectorAll('button')].forEach((b, k) => b.addEventListener('click', () => go(k)));
  paint(false);
}
