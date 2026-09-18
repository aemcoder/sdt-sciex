/**
 * breadcrumb — interior-page breadcrumb trail (live nav#breadcrumb): house icon → parent
 * crumbs → current page, 13/18 → 14/20 grey-500, chevron separators. Shared contract for
 * every interior page (applications landing, KB article).
 * Schema: stardust/eds-schema/applications-pharma-and-biopharma.json § breadcrumb.
 * Decode tier: reconstructive-light — the authored <ul> MOVES whole (one editable unit, EW1/EW5).
 *
 * Authoring (ONE row, ONE cell, one <ul>):
 *   <ul>
 *     <li><a href="/">Home</a></li>                      house icon (text hidden by CSS)
 *     <li><a href="https://sciex.com/applications">Applications</a></li>
 *     <li>Biopharma / pharma research</li>              current page — plain text; decode links it
 *   </ul>                                               to location.pathname (aria-current="page")
 *
 * The section that holds this block also carries the interior page top as DEFAULT CONTENT
 * (<h1>, lede <p>, full-bleed <p><img>) — styled in breadcrumb.css via .breadcrumb-container.
 */

export default function decorate(block) {
  const list = block.querySelector('ul, ol');
  if (!list) return;

  // Current page: the last item has no link on the ENCODE side; live renders it as a
  // self-link with aria-current — wrap the item's nodes (no text added, no text rebuilt).
  const last = list.lastElementChild;
  // Legacy templates render the last crumb as plain bold text (no self-link).
  const selfLink = !block.classList.contains('legacy');
  if (selfLink && last && !last.querySelector('a') && last.textContent.trim()) {
    const a = document.createElement('a');
    a.href = window.location.pathname;
    a.setAttribute('aria-current', 'page');
    a.append(...last.childNodes);
    last.append(a);
  }
  const home = list.firstElementChild && list.firstElementChild.querySelector('a');
  if (home && !home.getAttribute('aria-label')) home.setAttribute('aria-label', 'Go to homepage');

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const container = document.createElement('div');
  container.className = 'container';
  const trail = document.createElement('div');
  trail.className = 'breadcrumb-trail';
  trail.append(list);
  container.append(trail);
  nav.append(container);
  block.replaceChildren(nav);
}
