/**
 * sub-nav — sticky in-page anchor bar with scroll-spy (live .page-sub-nav on the v3
 * application landings). Schema: stardust/eds-schema/applications-pharma-and-biopharma.json
 * § sub-nav (4 ctas). Decode tier: reconstructive-light — the authored <ul> MOVES whole into
 * the bar (one editable unit, EW1/EW5); nothing is rebuilt from text.
 *
 * Authoring (ONE row, ONE cell, one <ul> of anchors):
 *   <ul>
 *     <li><a href="#overview">Overview</a></li>
 *     <li><a href="#pharma-and-biopharma-applications">Applications</a></li>
 *     <li><a href="#perspectives">Perspectives</a></li>
 *     <li><a href="#thought-leaders">Stories</a></li>
 *   </ul>
 * Each hash is the id the pipeline gives the target section's heading (its slug); the block
 * scrolls/spies on that element's SECTION (`main > .section`). Fallback when nothing carries
 * the id (local harness, an eyebrow <p> instead of a heading): the first heading/paragraph in
 * <main> whose slug equals the hash; the block then sets the id on that section so deep links
 * resolve natively.
 *
 * Observed on live and mirrored here: the wrapper becomes sticky (`.sticky-subnav`, track gets
 * `.no-scrollbar`) on the first scroll; `.active` on the anchor whose section top has passed the
 * bar (threshold = bar height); anchor click glides to section top − 52 px. The sticky element is
 * this block's own SECTION (`.sub-nav-container`) — a block-level sticky would only stick within
 * its section.
 */

const slug = (t) => t.toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-+|-+$/g, '');

function resolveTarget(link) {
  let hash = '';
  try { hash = new URL(link.href, window.location.href).hash; } catch { hash = link.getAttribute('href') || ''; }
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id) return null;
  let el = document.getElementById(id);
  if (!el) {
    el = [...document.querySelectorAll('main :is(h1, h2, h3, h4, h5, h6, p)')]
      .find((h) => slug(h.textContent) === id && !h.closest('.sub-nav')) || null;
  }
  if (!el) return null;
  const section = el.closest('main > .section, main > div') || el;
  if (!document.getElementById(id)) section.id = id;
  return section;
}

export default function decorate(block) {
  const list = block.querySelector('ul, ol');
  if (!list) return;

  const bar = document.createElement('div');
  bar.className = 'sub-nav-bar';
  const outer = document.createElement('div');
  outer.className = 'sub-nav-outer';
  const flex = document.createElement('div');
  flex.className = 'sub-nav-flex';
  const inner = document.createElement('div');
  inner.className = 'sub-nav-inner';
  const scroll = document.createElement('div');
  scroll.className = 'sub-nav-scroll';
  scroll.append(list);
  inner.append(scroll);
  flex.append(inner);
  outer.append(flex);
  bar.append(outer);
  block.replaceChildren(bar);

  const links = [...list.querySelectorAll('a[href]')];
  const section = block.closest('.section') || block.parentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let targets = [];
  const measure = () => { targets = links.map(resolveTarget); };

  const spy = () => {
    if (window.scrollY > 0 && section) {
      section.classList.add('sticky-subnav');
      scroll.classList.add('no-scrollbar');
    }
    if (!targets.some(Boolean)) measure();
    const navH = (section || block).getBoundingClientRect().height;
    let current = -1;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= navH) current = i; });
    links.forEach((a, i) => {
      a.classList.toggle('active', i === current);
      if (i === current) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  };

  links.forEach((a, i) => {
    a.addEventListener('click', (e) => {
      if (!targets[i]) measure();
      const t = targets[i];
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - 52;
      window.scrollTo({ top, behavior: reduce.matches ? 'auto' : 'smooth' });
    });
  });

  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  // targets decorate after this block (sections load in order) — resolve lazily and re-spy
  requestAnimationFrame(() => { measure(); spy(); });
  window.addEventListener('load', () => { measure(); spy(); });
}
