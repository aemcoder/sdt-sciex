/**
 * hero-band — live v3 `.hero-small` on the products / technology page-template: a full-bleed
 * picture band (420 / 512 px) under the page's hero-text, optionally with a 40 % black scrim,
 * or the `product` variant (grey-50 band: square product image | eyebrow, h1, lede, primary CTA).
 * Distinct from the ported `hero-small` block (sciex.com EDS port, contact-us: a 16-cell
 * positional shape read as text) — that shape cannot express this composition, so this block
 * carries the v3 hero-small (stardust/eds-conversion-log-g1.md § Reuse decisions).
 * Schema: stardust/eds-schema/products-mass-spectrometers.json § hero-small (image),
 * stardust/eds-schema/products-consumables.json § hero-small (product).
 * Decode tier: template-slotted — the prototype's inner DOM is rebuilt from generated wrappers
 * and the authored nodes MOVE into their slots (EW1–EW3).
 *
 * Variants (block class):
 *   hero-band          — picture only, no scrim (live /products)
 *   hero-band overlay  — picture + 40 % black overlay (live /products/mass-spectrometers …)
 *   hero-band product  — live .hero-small--product (/products/consumables): row-reverse from 768,
 *                        image max 416 px, title max-w 75 % / 66.7 %, lede 50 % / 75 %
 *
 * Authoring (simple shape — one row; the product variant is picture | body, a single flat cell
 * with every element as siblings also decodes):
 *   image:   <div><div><p><img src="https://content.da.live/…/media/products/<hero>.jpg"
 *                        alt=""></p></div></div>
 *   product: <div>
 *              <div><p><img src="…/reagents_424x334-w1920.jpg" alt=""></p></div>
 *              <div><p>Consumables and standards to help you succeed</p>   eyebrow (before the h1)
 *                   <h1>Consumables</h1>
 *                   <p>SCIEX kits, chemistries, consumables …</p>        lede
 *                   <p><strong><a href="…" target="_blank">Shop all consumables</a></strong></p>
 *              </div>
 *            </div>
 * No words are added by decorate(); the empty caption scaffold of the image variant is generated
 * (presentational, text-less) so the band measures like live.
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

// Every authored element of the block as flat siblings (cells may hold several elements; a
// bare-text cell — HARNESS-ONLY fallback, EW5 — has its text node moved into a fresh <p>).
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    // #104 — wrapTextNodes folds a media-led cell into ONE <p>; expand it back.
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img') && kids[0].childNodes.length > 1) {
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
const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const isCta = (n) => !isMedia(n) && !!n.querySelector('a');

export default async function decorate(block) {
  const nodes = collectNodes(block);
  const media = nodes.find(isMedia) || null;
  const heading = nodes.find(isHeading) || null;
  const ctas = nodes.filter((n) => n !== media && !isHeading(n) && isCta(n));
  const texts = nodes.filter((n) => n !== media && n !== heading && !ctas.includes(n));
  // canonical lead order: eyebrow (short, before the heading) → heading → lede (#51)
  const hIndex = heading ? nodes.indexOf(heading) : -1;
  const eyebrow = texts.filter((t) => hIndex >= 0 && nodes.indexOf(t) < hIndex);
  const lede = texts.filter((t) => !eyebrow.includes(t));

  const sec = el('section', 'hero-band-sec');
  const caption = el('div', 'hero-band-caption');
  const row = el('div', 'hero-band-row');
  const col = el('div', 'hero-band-col');

  if (block.classList.contains('product')) {
    caption.classList.add('hero-band-container-md');
    if (media) {
      const fig = el('div', 'hero-band-figure');
      const pic = media.matches('picture, img') ? media : media.querySelector('picture, img');
      const prod = wrapNode(pic, 'hero-band-product');
      fig.append(prod);
      row.append(fig);
    }
    if (eyebrow.length) { const e = el('div', 'hero-band-eyebrow'); e.append(...eyebrow); col.append(e); }
    if (heading) col.append(wrapNode(heading, 'hero-band-title'));
    if (lede.length) { const t = el('div', 'hero-band-text'); t.append(...lede); col.append(t); }
    if (ctas.length) {
      const inner = el('div', 'hero-band-inner');
      ctas.forEach((c) => inner.append(wrapNode(c, 'hero-band-btn')));
      col.append(inner);
    }
    row.append(col);
    caption.append(row);
    sec.append(caption);
  } else {
    caption.classList.add('container');
    const frame = el('div', 'hero-band-frame');
    if (media) frame.append(wrapNode(media, 'hero-band-media'));
    if (block.classList.contains('overlay')) frame.append(el('div', 'hero-band-overlay'));
    const inner = el('div', 'hero-band-inner');
    if (eyebrow.length) inner.append(...eyebrow);
    if (heading) inner.append(wrapNode(heading, 'hero-band-title'));
    if (lede.length) inner.append(...lede);
    ctas.forEach((c) => inner.append(wrapNode(c, 'hero-band-btn')));
    col.append(inner);
    row.append(col);
    caption.append(row);
    frame.append(caption);
    sec.append(frame);
  }
  block.replaceChildren(sec);
}
