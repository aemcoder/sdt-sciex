/**
 * image-map — the SCIEX Now support-network infographic of /support (live .htmlInjectionContainer
 * .ig-comp): seven hexagon-cluster PNG states, a copy panel on the right that swaps with the
 * hovered hotspot (live jQuery .hover over <area> elements, leaving restores state 1), and a
 * stacked list of the six service copies below 1024px. Prototype:
 * stardust/prototypes/support-proposed.html `.ig-comp`; schema: stardust/eds-schema/support.json §
 * image-map. Decode tier: reconstructive — ONE ROW PER HOTSPOT STATE, rows map to the fixed
 * hotspots by order; authors edit copy and artwork per state, the geometry is a developer concern
 * (D15).
 *
 * Authoring rows (container shape), row N = state N:
 *   picture | <h2>State title</h2><h3>State copy</h3>
 *   row 1 = the rest state (its copy shows at rest on desktop and is NOT listed on mobile, as
 *   live);
 *   rows 2..7 = the six services (hovered on desktop, stacked on mobile). The authored pictures and
 *   headings MOVE (EW1); every copy element exists once in the DOM — desktop and mobile are two CSS
 *   layouts of the same nodes. The <map>/<area> hotspots and the [hidden] toggles carry no text.
 *   Hover swap is instantaneous on live (no motion), so prefers-reduced-motion needs no branch;
 *   hotspots are keyboard reachable (tabindex 0, focus/blur mirror enter/leave).
 */

/* live <map name="Map"> coordinates (CSS px of the rendered 1140×400 artwork) — one design asset */
const HOTSPOTS = [
  '130,121,244,227',
  '187,0,420,121',
  '244,121,420,227',
  '187,227,420,349',
  '0,227,187,349',
  '0,130,130,227',
  '0,0,187,121',
];

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

let uid = 0;

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  uid += 1;
  const mapName = `image-map-${uid}`;

  const stage = el('div', 'ig-stage');
  const copy = el('div', 'ig-copy');
  const images = el('div', 'ig-images');
  const map = document.createElement('map');
  map.name = mapName;

  const states = rows.map((row, i) => {
    const pic = row.querySelector('picture, img');
    const cells = [...row.children];
    const copyCell = cells.find((c) => !c.contains(pic)) || cells[cells.length - 1];
    const item = el('div', 'ig-copy-item');
    if (copyCell) item.append(...copyCell.childNodes);
    copy.append(item);
    let frame = null;
    if (pic) {
      frame = el('div', 'ig-image');
      frame.append(pic.closest('p') || pic);
      const img = frame.querySelector('img');
      if (img) img.useMap = `#${mapName}`;
      if (i > 0) frame.hidden = true;
      images.append(frame);
    }
    return { item, frame };
  });

  const show = (n) => {
    states.forEach((s, i) => {
      s.item.classList.toggle('is-active', i === n);
      if (s.frame) s.frame.hidden = i !== n;
    });
  };

  states.forEach((s, i) => {
    if (!HOTSPOTS[i]) return;
    const area = document.createElement('area');
    area.shape = 'rect';
    area.coords = HOTSPOTS[i];
    // an <area> only hit-tests with an href (live: href="#"); the click is a no-op
    area.href = '#';
    area.addEventListener('click', (e) => e.preventDefault());
    const heading = s.item.querySelector('h1, h2, h3, h4');
    if (heading) area.setAttribute('aria-label', heading.textContent.trim());
    area.addEventListener('mouseenter', () => show(i));
    area.addEventListener('focus', () => show(i));
    if (i > 0) {
      area.addEventListener('mouseleave', () => show(0));
      area.addEventListener('blur', () => show(0));
    }
    map.append(area);
  });

  stage.append(copy, images, map);
  block.replaceChildren(stage);
  show(0);
}
