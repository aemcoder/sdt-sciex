/**
 * hero — home dark media hero (live .hero-small): full-bleed picture behind a 40 % black
 * scrim, copy bottom-aligned in the container, one primary CTA.
 * Schema: stardust/eds-schema/index.json § hero (heading, body, cta). Decode tier:
 * template-slotted (#95) — the prototype's inner DOM is the template, authored nodes MOVE
 * into role slots (EW1–EW3).
 *
 * Authoring (Block Collection hero — ONE cell, flat siblings, any order):
 *   <img src="https://content.da.live/…/media/home/hero.jpg" alt="">   editorial background
 *   <h1>The leader in mass spectrometry …</h1>                          page <h1>
 *   <p>There, where it counts. …</p>                                    lede
 *   <p><strong><a href="…">Our products</a></strong></p>                primary CTA
 * Also tolerates one-element-per-row authoring (collector iterates cells).
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

// HARNESS-ONLY fallback (EW5): a bare text node in a cell becomes a <p> holding that node.
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
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

export default async function decorate(block) {
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const media = block.querySelector('picture, img');
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const isCta = (n) => n.tagName === 'P' && n.querySelector('a');
  const ledes = nodes.filter((n) => n.tagName === 'P' && !isCta(n) && !n.querySelector('picture, img'));
  const ctas = nodes.filter(isCta);
  const leftovers = nodes.filter((n) => n !== heading && !ledes.includes(n) && !ctas.includes(n)
    && !(media && (n === media || n.contains(media))));

  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  if (media) {
    const img = media.matches('img') ? media : media.querySelector('img');
    if (img) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); }
    inner.append(wrapNode(media.closest('p') || media, 'hero-media'));
  }
  const overlay = document.createElement('div');
  overlay.className = 'hero-overlay';
  inner.append(overlay);

  const container = document.createElement('div');
  container.className = 'container hero-box';
  const row = document.createElement('div');
  row.className = 'hero-row';
  const copy = document.createElement('div');
  copy.className = 'hero-copy';
  if (heading) copy.append(wrapNode(heading, 'hero-title'));
  ledes.forEach((p) => copy.append(wrapNode(p, 'hero-lede')));
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-ctas';
    actions.append(...ctas);
    copy.append(actions);
  }
  leftovers.forEach((n) => copy.append(n)); // unconsumed authored types stay visible
  row.append(copy);
  container.append(row);
  inner.append(container);

  block.replaceChildren(inner);
}
