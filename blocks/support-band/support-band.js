/**
 * support-band — "SCIEX Now support network" band (live footer XF .support-band): dark
 * grey-800 band, title + sub-line left, one primary CTA right. Reused as the LAST section
 * of every page. Schema: none on the home schema (the band sits outside the prototype's
 * <main>); roles: heading, body, cta. Decode tier: template-slotted (#95).
 *
 * Authoring (ONE cell, flat siblings):
 *   <h2>SCIEX Now support network</h2>
 *   <p>The destination for all your support needs.</p>
 *   <p><strong><a href="https://sciex.com/about-us/contact-us">Contact support</a></strong></p>
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

// HARNESS-ONLY fallback (EW5): bare text in a cell is wrapped as a <p> holding that node.
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
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const ctas = nodes.filter((n) => n.tagName === 'P' && n.querySelector('a'));
  const subs = nodes.filter((n) => n !== heading && !ctas.includes(n));

  const container = document.createElement('div');
  container.className = 'container';
  const row = document.createElement('div');
  row.className = 'support-band-row';
  const copy = document.createElement('div');
  copy.className = 'support-band-copy';
  if (heading) copy.append(wrapNode(heading, 'support-band-title'));
  subs.forEach((n) => copy.append(wrapNode(n, 'support-band-sub')));
  row.append(copy);
  if (ctas.length) {
    const cta = document.createElement('div');
    cta.className = 'support-band-cta';
    cta.append(...ctas);
    row.append(cta);
  }
  container.append(row);
  block.replaceChildren(container);
}
