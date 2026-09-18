/**
 * header — SCIEX v3 chrome (live #mega-menu experience fragment): dark top bar (logo,
 * search box + content-type dropdown, Login + account dropdown, Shop, Request a quote,
 * SCIEX Now Dashboard), white primary-nav row with a click-driven mega menu, mobile top bar
 * (search / hamburger) with a level-1 drawer. Decode tier: template-slotted (#95) — the
 * prototype's chrome DOM (stardust/prototypes/home-proposed.html <header>) is the template;
 * the authored /nav document fills fixed role slots. Behaviour per
 * stardust/prototypes/interaction-spec.md (observed live; no hover effects, no scroll morph).
 *
 * /nav document contract (content/nav.html — sections in this ORDER):
 *   1 brand    <p><a href="/">Go to Sciex homepage</a></p>  (text → sr-only; inline SVG logos)
 *   2 sections <ul> 8 top-level items, each <li><a href="/products">Products</a><ul>…</ul></li>
 *              L2 <li>Panel label<ul>…</ul></li>  — one mega-menu panel (left-column item)
 *              L2 <li><a href="/products">View all Products</a></li> — a trailing L2 item WITHOUT a
 *                 nested list is the menu's "view all" link
 *              L3 <li><a href>Group head</a><ul><li><a>link</a></li>…</ul></li> — a link group
 *              L3 <li><a href><img alt></a></li> — a promo tile (linked image)
 *              L3 <li><a href>Tile title</a> description text</li> — a Training tile (head + text);
 *                 a menu whose single panel holds only such items renders the flat tile grid
 *   3 tools    <ul> Login · Shop · Request a quote · SCIEX Now Dashboard · My account (mobile)
 *   4 account  <ul> logged-out dropdown: Create an account · Already have an account?
 *              <strong>Sign in now</strong> · My profile · My favorite resources
 *   5 search   <ul> content-type facet values (All first)
 * Dispositions (stardust/dynamic-features.md): S-01 search = redirecting GET form to
 * /search-results (no Coveo suggestions); X-01 account = logged-out chrome, links absolute to
 * sciex.com; X-02 Shop = external link; M-01 mega menu rebuilt native (level-2 mobile panels
 * are a logged follow-up — level-1 items link to their section landing page).
 * @ew-exempt all — chrome fragment; every string is authored in /nav and MOVED, generated
 * strings are limited to control labels (Search, Close search, Open menu, Close menu, Close
 * navigation, placeholders) and the mobile "View all" duplicate of the authored view-all link.
 */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { site } from '../../scripts/site-config.js';

const SVG = {
  logoDesktop: '<svg class="hdr-logo-desktop" aria-hidden="true" fill="none" height="32" viewBox="0 0 95 32" width="95" xmlns="http://www.w3.org/2000/svg"><path d="M53.5111 13.9844H48.8047V31.7168H53.5111V13.9844Z" fill="white"></path><path d="M56.1016 13.9844H68.559V17.338H60.8117V20.998H68.1257V24.3516H60.8117V28.3631H68.8378V31.7168H56.1016V13.9844Z" fill="white"></path><path d="M74.9153 22.3969L69.802 13.9844H75.2959L78.2577 19.8297L81.2985 13.9844H86.4646L81.2985 22.3969L86.9696 31.7168H81.3475L77.9298 25.191L74.5347 31.7168H69.1953L74.9153 22.3969Z" fill="white"></path><path d="M46.3216 27.9716C45.2597 28.3041 44.1556 28.4812 43.0433 28.4972C39.5992 28.4972 37.1462 26.3912 37.1462 22.9128C37.1462 19.612 39.3204 17.1771 42.6627 17.1771C43.9239 17.1777 45.1708 17.4457 46.3216 17.9636V14.228C45.0452 13.8855 43.7314 13.7026 42.4103 13.6836C36.5885 13.6836 32.2891 16.7537 32.2891 22.9241C32.2891 29.6239 37.7302 31.9983 42.4329 31.9983C43.7389 32.0139 45.0428 31.8872 46.3216 31.6202V27.9716Z" fill="white"></path><path d="M14.8728 17.5938L0 31.7154L2.26088 31.0311C2.26088 31.0311 11.3044 24.4296 16.203 21.6582C15.3085 20.4957 14.8353 19.0622 14.8615 17.5938" fill="white"></path><path d="M37.6822 3.67596C32.5521 5.25971 27.6083 7.39707 22.9375 10.0506C23.5795 9.98158 24.2248 9.94751 24.8706 9.94848C26.7202 9.93174 28.5618 10.193 30.3343 10.7236L30.5642 10.803C34.6677 8.56845 39.7358 6.69691 44.8416 5.04087C55.5491 1.56199 66.9322 0.711431 78.0351 2.5606C68.8296 -0.914052 52.8828 -1.14091 37.6822 3.67596Z" fill="white"></path><path d="M22.3255 31.92C20.3535 31.9199 18.3913 31.6424 16.4962 31.0957L16.922 26.9859C18.6018 27.8172 20.4525 28.242 22.3255 28.226C23.1771 28.226 25.7771 28.226 25.7771 26.1201C25.7771 24.4451 24.0739 23.9272 22.0994 23.3298C19.3713 22.498 16.2852 21.5679 16.2852 17.3862C16.2852 11.9455 22.3142 11.3594 24.884 11.3594C26.5839 11.355 28.2752 11.6021 29.9032 12.0929L29.5829 15.9116C28.21 15.3347 26.7341 15.0452 25.2458 15.0609C24.2246 15.0609 21.504 15.0609 21.504 17.0837C21.504 18.5016 23.1092 18.9742 24.9669 19.477C27.6536 20.2332 30.9959 21.1822 30.9959 25.4282C30.9959 30.7895 26.2745 31.92 22.3292 31.92" fill="white"></path><path d="M78.25 0.988281C80.7725 2.06581 83.1207 3.5147 85.2173 5.28717C87.8286 7.55571 93.5072 13.6619 84.1584 24.6945L86.977 29.0653C93.0738 23.9006 105.105 7.29483 78.25 0.988281Z" fill="white"></path></svg>',
  logoMobile: '<svg class="hdr-logo-mobile" aria-hidden="true" fill="none" height="28" viewBox="0 0 88 28" width="88" xmlns="http://www.w3.org/2000/svg"><path d="M49.5683 12.235H45.2087V27.7509H49.5683V12.235Z" fill="white"></path><path d="M51.9662 12.235H63.5057V15.1695H56.3293V18.3719H63.1043V21.3064H56.3293V24.8165H63.764V27.7509H51.9662V12.235Z" fill="white"></path><path d="M69.3942 19.596L64.6576 12.235H69.7467L72.4902 17.3497L75.3071 12.235H80.0925L75.3071 19.596L80.5602 27.7509H75.3524L72.1866 22.0408L69.0416 27.7509H64.0956L69.3942 19.596Z" fill="white"></path><path d="M42.9084 24.4758C41.9248 24.7668 40.902 24.9217 39.8717 24.9357C36.6814 24.9357 34.4091 23.093 34.4091 20.0494C34.4091 17.1612 36.4231 15.0307 39.5191 15.0307C40.6874 15.0311 41.8424 15.2656 42.9084 15.7188V12.4502C41.726 12.1505 40.5091 11.9904 39.2853 11.9738C33.8925 11.9738 29.9099 14.6601 29.9099 20.0593C29.9099 25.9216 34.9501 27.9992 39.3062 27.9992C40.516 28.0129 41.7239 27.9019 42.9084 27.6683V24.4758Z" fill="white"></path><path d="M13.7769 15.3939L0 27.7503L2.09429 27.1515C2.09429 27.1515 10.4714 21.3752 15.0091 18.9503C14.1805 17.9331 13.7422 16.6787 13.7664 15.3939" fill="white"></path><path d="M34.9049 3.21647C30.1528 4.60225 25.5732 6.47244 21.2466 8.79425C21.8414 8.73389 22.4391 8.70407 23.0373 8.70492C24.7506 8.69027 26.4566 8.91887 28.0985 9.38312L28.3114 9.4526C32.1125 7.4974 36.8072 5.85979 41.5368 4.41076C51.4553 1.36674 61.9996 0.622502 72.2844 2.24052C63.7572 -0.799795 48.9855 -0.998293 34.9049 3.21647Z" fill="white"></path><path d="M20.6809 27.9293C18.8542 27.9292 17.0366 27.6865 15.2811 27.2081L15.6755 23.612C17.2316 24.3394 18.9459 24.711 20.6809 24.6971C21.4697 24.6971 23.8781 24.6971 23.8781 22.8544C23.8781 21.3888 22.3005 20.9356 20.4714 20.4129C17.9443 19.6851 15.0856 18.8712 15.0856 15.2122C15.0856 10.4516 20.6704 9.93883 23.0509 9.93883C24.6255 9.93491 26.1922 10.1512 27.7002 10.5806L27.4035 13.922C26.1318 13.4172 24.7647 13.1638 23.386 13.1776C22.4401 13.1776 19.9199 13.1777 19.9199 14.9476C19.9199 16.1882 21.4069 16.6017 23.1277 17.0417C25.6164 17.7034 28.7125 18.5338 28.7125 22.249C28.7125 26.9401 24.3389 27.9293 20.6844 27.9293" fill="white"></path><path d="M72.4832 0.864075C74.8198 1.80691 76.995 3.07469 78.9371 4.6256C81.356 6.61057 86.6162 11.9535 77.9563 21.6071L80.5672 25.4314C86.2148 20.9123 97.3599 6.3823 72.4832 0.864075Z" fill="white"></path></svg>',
  mobSearch: '<svg aria-hidden="true" fill="" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M18.0007 11C18.0007 14.866 14.8667 18 11.0007 18C7.13474 18 4.00073 14.866 4.00073 11C4.00073 7.13401 7.13474 4 11.0007 4C14.8667 4 18.0007 7.13401 18.0007 11ZM16.293 16.9994C14.8827 18.2445 13.0299 19 11.0007 19C6.58245 19 3.00073 15.4183 3.00073 11C3.00073 6.58172 6.58245 3 11.0007 3C15.419 3 19.0007 6.58172 19.0007 11C19.0007 13.0292 18.2452 14.882 17.0001 16.2923L20.3543 19.6464L20.7078 20L20.0007 20.7071L19.6472 20.3536L16.293 16.9994Z" fill="#ffffff" fill-rule="evenodd"></path></svg>',
  mobCloseSearch: '<svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M4 20L19.9998 4.0002" stroke="white" stroke-width="1.2"></path><path d="M4 4L19.9998 19.9998" stroke="white" stroke-width="1.2"></path></svg>',
  mobMenu: '<svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 20H20" stroke="#ffffff"></path><path d="M0 4H24" stroke="#ffffff"></path><path d="M0 12H16" stroke="#ffffff"></path></svg>',
  mobCloseMenu: '<svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M4 20L19.9998 4.0002" stroke="white" stroke-width="1.2"></path><path d="M4 4L19.9998 19.9998" stroke="white" stroke-width="1.2"></path></svg>',
  dropbtnChevron: '<svg aria-hidden="true" fill="none" height="16" viewBox="0 0 17 16" width="17" xmlns="http://www.w3.org/2000/svg"><path d="M14.7344 5L8.73437 11L2.73438 5" stroke="#141414"></path></svg>',
  searchBtn: '<svg aria-hidden="true" fill="none" height="20" viewBox="0 0 21 20" width="21" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M15.5677 9.16655C15.5677 12.2961 13.0307 14.8331 9.90104 14.8331C6.77141 14.8331 4.23438 12.2961 4.23438 9.16655C4.23438 6.03702 6.77141 3.5 9.90104 3.5C13.0307 3.5 15.5677 6.03702 15.5677 9.16655ZM14.2483 14.2209C13.0811 15.2257 11.562 15.8331 9.90104 15.8331C6.21914 15.8331 3.23438 12.8484 3.23438 9.16655C3.23438 5.48471 6.21914 2.5 9.90104 2.5C13.5829 2.5 16.5677 5.48471 16.5677 9.16655C16.5677 10.8275 15.9603 12.3466 14.9554 13.5138L17.7546 16.3129L18.1081 16.6664L17.401 17.3735L17.0475 17.02L14.2483 14.2209Z" fill="white" fill-rule="evenodd"></path></svg>',
  loginIcon: '<svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M8.0013 8.66667C9.84225 8.66667 11.3346 7.17428 11.3346 5.33333C11.3346 3.49238 9.84225 2 8.0013 2C6.16035 2 4.66797 3.49238 4.66797 5.33333C4.66797 7.17428 6.16035 8.66667 8.0013 8.66667Z" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M1 14.332L2.6 11.332H13.4L15 14.332" stroke="currentColor"></path></svg>',
  accountChevron: '<svg aria-hidden="true" fill="none" height="16" viewBox="0 0 17 16" width="17" xmlns="http://www.w3.org/2000/svg"><path d="M14.7344 5L8.73437 11L2.73438 5" stroke="#FFFFFF"></path></svg>',
  shopIcon: '<svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75L18 6.75" stroke="white" stroke-width="1.125"></path><path d="M2.25 6.75L3.9375 15.75H14.0625L15.75 6.75" stroke="white" stroke-width="1.125"></path><path d="M2.25 4.5L4.5 1.125" stroke="white" stroke-width="1.125"></path><path d="M15.75 4.5L13.5 1.125" stroke="white" stroke-width="1.125"></path><path d="M9 9V13.5" stroke="white" stroke-width="1.125"></path><path d="M6.1875 9V13.5" stroke="white" stroke-width="1.125"></path><path d="M11.8125 9V13.5" stroke="white" stroke-width="1.125"></path></svg>',
  navChevron: '<svg aria-hidden="true" fill="none" height="8" viewBox="0 0 14 8" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M13 1L7 7L1 0.999999" stroke="currentColor"></path></svg>',
  megaChevron: '<svg fill="none" height="10" viewBox="0 0 6 10" width="6" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0.5 9.5L5 5L0.500001 0.499999" stroke="currentColor"></path></svg>',
  mobChevron: '<svg fill="none" height="16" viewBox="0 0 6 10" width="8" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0.5 9.5L5 5L0.500001 0.499999" stroke="currentColor"></path></svg>',
  arrow: '<svg fill="none" height="14" viewBox="0 0 16 14" width="16" aria-hidden="true"><path d="M0 7L15 7" stroke="currentColor"></path><path d="M9 1L15 7L9 13" stroke="currentColor"></path></svg>',
  close: '<svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 11L8 5L14 11" stroke="white"></path></svg>',
  profile: '<svg fill="none" height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="9" r="8.4727" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.125"></circle><circle cx="9" cy="7.8702" r="3.3891" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.125"></circle><path d="M3.945 15.8C4.216 13.248 6.376 11.26 9 11.26C11.624 11.26 13.784 13.248 14.055 15.8" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.125"></path></svg>',
  favourite: '<svg fill="none" height="18" viewBox="0 0 30 30" width="18" stroke="black" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 3.5l3.3 6.9 7.5 1-5.5 5.2 1.4 7.5L15 20.5l-6.7 3.6 1.4-7.5-5.5-5.2 7.5-1z" stroke-width="1.5" stroke-linejoin="round"></path></svg>',
};

const isDesktop = window.matchMedia('(min-width: 1024px)');

function el(tag, className, html) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (html) n.innerHTML = html;
  return n;
}

function stripInstrumentation(node) {
  node.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  node.removeAttribute('data-prose-index');
  return node;
}

// #98 — on live the pipeline wraps a list item's own link/label in a <p>; unwrap it.
function unwrapParagraphs(li) {
  [...li.children].forEach((c) => { if (c.tagName === 'P') c.replaceWith(...c.childNodes); });
  return li;
}
const ownLink = (li) => (li ? li.querySelector(':scope > a, :scope > p > a') : null);
const ownList = (li) => (li ? li.querySelector(':scope > ul, :scope > ol') : null);
// the item's label nodes: everything that is not its nested list
function labelNodes(li) {
  unwrapParagraphs(li);
  return [...li.childNodes].filter((n) => !(n.nodeType === 1 && /^(UL|OL)$/.test(n.tagName)) && !(n.nodeType === 3 && !n.textContent.trim()));
}
function srOnlyText(a) {
  const span = el('span', 'sr-only');
  span.append(...a.childNodes);
  a.append(span);
  return a;
}

/* ---------------- mega menu ---------------- */
function buildGroup(li) {
  const group = el('div', 'hdr-mega-group');
  const head = ownLink(li);
  const sub = ownList(li);
  if (head) {
    const label = el('span', 'hdr-mega-head');
    const text = el('span');
    text.append(...head.childNodes);
    label.append(text, el('span', '', SVG.megaChevron));
    head.append(label);
    group.append(head);
  }
  if (sub) {
    [...sub.children].forEach((item) => {
      const a = ownLink(item);
      if (!a) return;
      const label = el('span', 'hdr-mega-link');
      const text = el('span');
      text.append(...a.childNodes);
      label.append(text, el('span', '', SVG.megaChevron));
      a.append(label);
      group.append(a);
    });
  }
  return group;
}

function buildTile(li) {
  const tile = el('div', 'hdr-mega-tile');
  const head = ownLink(li);
  if (!head) return tile;
  const rest = labelNodes(li).filter((n) => n !== head);
  const label = el('span', 'hdr-mega-head');
  const text = el('span');
  text.append(...head.childNodes);
  label.append(text, el('span', '', SVG.megaChevron));
  head.append(label);
  if (rest.length) {
    const p = rest.length === 1 && rest[0].nodeType === 1 && rest[0].tagName === 'P' ? rest[0] : el('p');
    if (p !== rest[0]) p.append(...rest);
    head.append(p);
  }
  tile.append(head);
  return tile;
}

function buildPromo(li) {
  const wrap = el('div');
  const a = li.querySelector('a') || el('a');
  const pic = li.querySelector('picture, img');
  const box = el('div', 'hdr-mega-promo-img');
  if (pic) box.append(pic);
  a.replaceChildren(box);
  wrap.append(a);
  return wrap;
}

function buildMenu(topLi, index) {
  const l2 = ownList(topLi);
  if (!l2) return null;
  const items = [...l2.children];
  const panelItems = items.filter((li) => ownList(li));
  const viewAll = items.filter((li) => !ownList(li)).map(ownLink).find(Boolean) || null;
  const menu = el('div', 'hdr-mega-menu');
  menu.dataset.menu = String(index);
  const cols = el('div', 'container hdr-mega-cols');

  // tiles layout (live Training menu): one panel whose items carry no nested list
  const tiles = panelItems.length === 1 && [...ownList(panelItems[0]).children].every((li) => !ownList(li) && !li.querySelector('picture, img'));
  if (tiles) {
    menu.classList.add('hdr-mega-menu-tiles');
    const panel = el('div', 'hdr-mega-panel hdr-mega-panel-training is-open');
    const gridWrap = el('div', 'container');
    const grid = el('div', 'hdr-mega-tiles');
    const inner = el('div');
    [...ownList(panelItems[0]).children].forEach((li, i) => {
      const t = buildTile(li);
      if (i >= 4) t.classList.add('hdr-mega-tile-mt');
      inner.append(t);
    });
    grid.append(inner);
    gridWrap.append(grid);
    panel.append(gridWrap);
    if (viewAll) {
      const va = el('div', 'container');
      const inner2 = el('div', 'hdr-mega-viewall-wrap');
      viewAll.className = 'hdr-mega-viewall';
      const d = el('div');
      d.append(...viewAll.childNodes, el('span', 'link-arrow-underline'));
      viewAll.append(d, el('span', '', SVG.arrow));
      inner2.append(viewAll);
      va.append(inner2);
      panel.append(va);
    }
    menu.append(panel);
    return menu;
  }

  const wide = panelItems.length < 7;
  const left = el('div', 'hdr-mega-left');
  const subList = el('ul');
  const panels = el('div', 'hdr-mega-panels');
  panelItems.forEach((li, k) => {
    const subLi = el('li');
    const sub = el('a', `hdr-mega-sub${k === 0 ? ' submenu-active' : ''}`);
    sub.href = '#';
    sub.setAttribute('role', 'button');
    sub.dataset.sub = String(k);
    const span = el('span');
    span.append(...labelNodes(li));
    sub.append(span);
    subLi.append(sub);
    subList.append(subLi);

    const panel = el('div', `hdr-mega-panel${k === 0 ? ' is-open' : ''}`);
    const mid = el('div', `hdr-mega-mid${wide ? ' hdr-mega-mid-wide' : ''}${panelItems.length >= 7 ? ' hdr-mega-mid-border' : ''}`);
    const groups = el('div', 'hdr-mega-groups');
    const promo = el('div', 'hdr-mega-promo');
    let g = 0;
    [...ownList(li).children].forEach((item) => {
      if (item.querySelector('picture, img')) {
        if (promo.children.length) promo.append(el('br'));
        promo.append(buildPromo(item));
      } else {
        const group = buildGroup(item);
        if (g >= 2) group.classList.add('hdr-mega-group-mt');
        groups.append(group);
        g += 1;
      }
    });
    mid.append(groups);
    panel.append(mid);
    if (promo.children.length) panel.append(promo);
    panels.append(panel);
    sub.addEventListener('click', (e) => {
      e.preventDefault();
      subList.querySelectorAll('.hdr-mega-sub').forEach((s) => s.classList.remove('submenu-active'));
      panels.querySelectorAll('.hdr-mega-panel').forEach((p) => p.classList.remove('is-open'));
      sub.classList.add('submenu-active');
      panel.classList.add('is-open');
    });
  });
  left.append(subList);
  if (viewAll) {
    viewAll.className = 'hdr-mega-viewall';
    const d = el('div');
    d.append(...viewAll.childNodes, el('span', 'link-arrow-underline'));
    viewAll.append(d, el('span', '', SVG.arrow));
    left.append(viewAll);
  }
  cols.append(left, panels);
  menu.append(cols);
  return menu;
}

/* ---------------- header ---------------- */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const sections = [...fragment.children];
  const [brandSec, navSec, toolsSec, accountSec, searchSec] = sections;

  const root = el('div', 'site-header');
  const nav = el('nav', 'hdr-top');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main menu');
  nav.setAttribute('aria-expanded', 'false');
  const top = el('div', 'container hdr-top-inner');

  // 1 brand
  const brandLink = brandSec ? brandSec.querySelector('a') : null;
  const logo = brandLink || el('a');
  if (!brandLink) logo.href = '/';
  logo.className = 'hdr-logo';
  if (!logo.getAttribute('aria-label')) logo.setAttribute('aria-label', logo.textContent.trim() || 'Go to Sciex homepage');
  srOnlyText(logo);
  logo.insertAdjacentHTML('afterbegin', SVG.logoDesktop + SVG.logoMobile);
  top.append(logo);

  // mobile top-bar actions (stock hamburger machinery restyled: aria-controls / aria-expanded)
  const actions = el('div', 'hdr-mobile-actions');
  const actionsList = el('ul');
  const mkAction = (action, svg, label, hidden, expanded) => {
    const li = el('li');
    li.dataset.action = action;
    if (hidden) li.hidden = true;
    const b = el('button');
    b.type = 'button';
    b.setAttribute('aria-controls', 'nav');
    if (expanded !== undefined) b.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    b.innerHTML = `<span aria-hidden="true">${svg}</span><span class="sr-only">${label}</span>`;
    li.append(b);
    actionsList.append(li);
    return li;
  };
  const liSearch = mkAction('search', SVG.mobSearch, 'Search', false);
  const liCloseSearch = mkAction('close-search', SVG.mobCloseSearch, 'Close search', true);
  const liMenu = mkAction('menu', SVG.mobMenu, 'Open menu', false, false);
  const liCloseMenu = mkAction('close-menu', SVG.mobCloseMenu, 'Close menu', true, true);
  actions.append(actionsList);
  top.append(actions);

  // desktop search (S-01: redirecting GET form)
  const search = el('form', 'hdr-search');
  search.setAttribute('role', 'search');
  search.method = 'get';
  search.action = site.searchResultsPath;
  const input = el('input', 'hdr-search-box');
  input.type = 'text'; input.name = 'term'; input.placeholder = 'Search'; input.setAttribute('aria-label', 'Search'); input.maxLength = 200; input.id = 'standalone-search-box';
  const typeInput = el('input');
  typeInput.type = 'hidden'; typeInput.name = 'contentType'; typeInput.value = '';
  const dropdown = el('div', 'hdr-dropdown');
  const dropbtn = el('button', 'hdr-dropbtn');
  dropbtn.type = 'button'; dropbtn.setAttribute('aria-haspopup', 'true'); dropbtn.setAttribute('aria-expanded', 'false');
  const dropLabel = el('span');
  const dropContent = el('div', 'hdr-dropdown-content');
  const typeList = searchSec ? searchSec.querySelector('ul') : null;
  if (typeList) {
    [...typeList.children].forEach((li, i) => {
      unwrapParagraphs(li);
      const a = el('a');
      a.href = '#';
      a.append(...li.childNodes);
      if (i === 0) dropLabel.textContent = a.textContent.trim();
      a.addEventListener('click', (e) => {
        e.preventDefault();
        dropLabel.textContent = a.textContent.trim();
        typeInput.value = i === 0 ? '' : a.textContent.trim();
        dropContent.classList.remove('is-open');
        dropbtn.setAttribute('aria-expanded', 'false');
      });
      dropContent.append(a);
    });
  }
  dropbtn.append(dropLabel, el('span', '', SVG.dropbtnChevron));
  dropdown.append(dropbtn, dropContent);
  const searchBtn = el('button', 'hdr-search-btn', SVG.searchBtn);
  searchBtn.type = 'submit'; searchBtn.setAttribute('aria-label', 'Search');
  search.append(input, typeInput, dropdown, searchBtn);
  top.append(search);

  // desktop utility row (tools list, positional:
  // Login · Shop · Request a quote · Dashboard · My account)
  const tools = toolsSec ? [...(toolsSec.querySelector('ul') || toolsSec).children].map(unwrapParagraphs) : [];
  const [loginLi, shopLi, rfqLi, dashLi] = tools;
  const toolLink = tools.map(ownLink); // captured BEFORE the anchors move (EW1 sibling-walk rule)
  const utility = el('div', 'hdr-utility');
  const utilList = el('ul');
  if (loginLi) {
    const li = el('li', 'hdr-utility-link');
    li.id = 'login';
    const a = ownLink(loginLi);
    if (a) { a.insertAdjacentHTML('afterbegin', SVG.loginIcon); li.append(a); }
    const acc = el('div', 'hdr-dropdown');
    acc.id = 'accountDropdown';
    const accBtn = el('button', 'hdr-dropbtn hdr-dropbtn-account', SVG.accountChevron);
    accBtn.type = 'button'; accBtn.setAttribute('aria-label', 'Account menu'); accBtn.setAttribute('aria-haspopup', 'true'); accBtn.setAttribute('aria-expanded', 'false');
    const accContent = el('div', 'hdr-dropdown-content hdr-dropdown-content-account');
    const accItems = accountSec ? [...(accountSec.querySelector('ul') || accountSec).children].map(unwrapParagraphs) : [];
    accItems.forEach((item, i) => {
      const link = ownLink(item);
      if (!link) return;
      if (i === 0) { link.className = 'hdr-create-account'; const d = el('div'); d.append(link); accContent.append(d); return; }
      if (i === 1) { link.id = 'signInNowLink'; const strong = link.querySelector('strong'); if (strong) strong.className = 'hdr-sign-in'; accContent.append(link); return; }
      link.className = 'hdr-myprofile';
      link.insertAdjacentHTML('afterbegin', i === 2 ? SVG.profile : SVG.favourite);
      accContent.append(link);
    });
    acc.append(accBtn, accContent);
    li.append(acc);
    utilList.append(li);
  }
  if (shopLi) {
    const li = el('li', 'hdr-utility-link');
    li.id = 'shop';
    const a = ownLink(shopLi);
    if (a) { a.insertAdjacentHTML('afterbegin', SVG.shopIcon); li.append(a); }
    utilList.append(li);
  }
  if (rfqLi) {
    const li = el('li', 'hdr-rfq');
    li.id = 'request-a-quote';
    const a = ownLink(rfqLi);
    if (a) li.append(a);
    utilList.append(li);
  }
  if (dashLi) {
    const li = el('li');
    const a = ownLink(dashLi);
    if (a) {
      a.className = 'hdr-dash'; a.id = 'sciex-now-dash';
      const d = el('div'); const s = el('span'); s.append(...a.childNodes); d.append(s); a.append(d);
      li.append(a);
    }
    utilList.append(li);
  }
  utility.append(utilList);
  top.append(utility);
  nav.append(top);
  root.append(nav);

  // mobile search
  const mobSearch = el('div', 'hdr-mob-search');
  const mobForm = el('form', 'hdr-mob-search-form');
  mobForm.setAttribute('role', 'search'); mobForm.method = 'get'; mobForm.action = site.searchResultsPath;
  mobForm.innerHTML = '<label class="sr-only" for="search-input-mobile">Enter search term</label><input id="search-input-mobile" name="term" type="text" placeholder="Search..." maxlength="200"><button type="submit">Search</button>';
  mobSearch.append(mobForm);
  root.append(mobSearch);

  // primary nav + mega menus (authored nested lists)
  const navRoot = el('div', 'hdr-nav');
  const navContainer = el('div', 'container');
  const navRow = el('div', 'hdr-nav-row');
  const navList = el('ul');
  navList.setAttribute('role', 'menubar');
  const mega = el('div', 'hdr-mega');
  const menus = [];
  const topItems = navSec ? [...((navSec.querySelector('ul') || navSec).children)] : [];
  const mobList = el('ul', 'hdr-mob-nav-list');
  topItems.forEach((topLi, i) => {
    const a = ownLink(topLi);
    if (!a) return;
    const menu = buildMenu(topLi, i);
    // mobile level-1 item — presentational clone, links to the section landing page
    // (follow-up: level-2 panels)
    const mobLi = el('li');
    const mobA = el('a');
    mobA.href = a.getAttribute('href') || '#';
    const mobSpan = el('span');
    mobSpan.append(...[...a.cloneNode(true).childNodes]
      .map((n) => (n.nodeType === 1 ? stripInstrumentation(n) : n)));
    mobA.append(mobSpan);
    mobA.insertAdjacentHTML('beforeend', SVG.mobChevron);
    mobLi.append(mobA);
    mobList.append(mobLi);

    const li = el('li');
    li.setAttribute('role', 'none');
    a.setAttribute('role', 'menuitem');
    if (menu) {
      a.setAttribute('aria-haspopup', 'true');
      a.setAttribute('aria-expanded', 'false');
      a.insertAdjacentHTML('beforeend', `<span>${SVG.navChevron}</span>`);
      menus[i] = menu;
      mega.append(menu);
    }
    li.append(a);
    navList.append(li);
  });
  navRow.append(navList, el('div', 'hdr-nav-spacer'));
  navContainer.append(navRow);
  navRoot.append(navContainer);

  // mobile drawer
  const mobNav = el('div', 'hdr-mob-nav');
  const mobInner = el('div', 'hdr-mob-nav-inner');
  const mobContainer = el('div', 'container');
  const resources = el('ul', 'hdr-mob-nav-resources');
  [toolLink[1], toolLink[4]].forEach((a, i) => {
    if (!a) return;
    const li = el('li');
    const clone = stripInstrumentation(a.cloneNode(true));
    clone.querySelectorAll('svg').forEach((s) => s.remove());
    clone.insertAdjacentHTML('afterbegin', i === 0 ? SVG.shopIcon : SVG.loginIcon);
    li.append(clone);
    resources.append(li);
  });
  mobContainer.append(mobList, resources);
  mobInner.append(mobContainer);
  if (toolLink[2]) {
    const rfq = el('a', 'hdr-mob-rfq');
    rfq.href = toolLink[2].href;
    rfq.id = 'header-request-info';
    const c = el('div', 'container');
    const s = el('span');
    s.append(...[...toolLink[2].cloneNode(true).childNodes]
      .map((n) => (n.nodeType === 1 ? stripInstrumentation(n) : n)));
    c.append(s, el('span', '', SVG.arrow));
    rfq.append(c);
    mobInner.append(rfq);
  }
  mobNav.append(mobInner);
  root.append(mobNav, navRoot);

  const closeBtn = el('button', 'hdr-mega-close');
  closeBtn.type = 'button';
  closeBtn.innerHTML = `<span class="sr-only">Close navigation</span><span>${SVG.close}</span>`;
  mega.append(closeBtn);
  root.append(mega);
  const mobOverlay = el('div', 'hdr-mob-overlay');
  const overlay = el('div', 'hdr-overlay');
  root.append(mobOverlay, overlay);

  /* ---------- behaviour (interaction-spec) ---------- */
  const navItems = [...navList.children];
  let openIndex = -1;
  const closeMega = () => {
    navItems.forEach((li) => { li.classList.remove('menu-active'); const a = li.querySelector('a'); if (a && a.hasAttribute('aria-expanded')) a.setAttribute('aria-expanded', 'false'); });
    menus.forEach((m) => m && m.classList.remove('is-open'));
    mega.classList.remove('is-open');
    closeBtn.classList.remove('is-open');
    overlay.classList.remove('is-open');
    openIndex = -1;
  };
  const openMega = (i) => {
    closeMega();
    const li = navItems[i];
    const menu = menus[i];
    if (!li || !menu) return;
    li.classList.add('menu-active');
    li.querySelector('a').setAttribute('aria-expanded', 'true');
    mega.classList.add('is-open');
    menu.classList.add('is-open');
    closeBtn.classList.add('is-open');
    overlay.classList.add('is-open');
    openIndex = i;
  };
  navItems.forEach((li, i) => {
    const a = li.querySelector('a');
    if (!a || !menus[i]) return;
    a.addEventListener('click', (e) => {
      if (!isDesktop.matches) return;
      e.preventDefault();
      if (openIndex === i) closeMega(); else openMega(i);
    });
  });
  closeBtn.addEventListener('click', closeMega);
  overlay.addEventListener('click', closeMega);

  const closeDropdowns = (except) => {
    root.querySelectorAll('.hdr-dropdown-content.is-open').forEach((d) => {
      if (d !== except) { d.classList.remove('is-open'); const b = d.parentElement.querySelector('.hdr-dropbtn'); if (b) b.setAttribute('aria-expanded', 'false'); }
    });
  };
  root.querySelectorAll('.hdr-dropbtn').forEach((btn) => {
    const content = btn.parentElement.querySelector('.hdr-dropdown-content');
    if (!content) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = content.classList.contains('is-open');
      closeDropdowns();
      if (!open) { content.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.hdr-dropdown')) closeDropdowns(); });

  const setMobile = (searchOpen, menuOpen) => {
    mobSearch.classList.toggle('is-open', searchOpen);
    mobNav.classList.toggle('is-open', menuOpen);
    mobOverlay.classList.toggle('is-open', menuOpen);
    liSearch.hidden = searchOpen;
    liCloseSearch.hidden = !searchOpen;
    liMenu.hidden = menuOpen;
    liCloseMenu.hidden = !menuOpen;
    nav.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
    liMenu.querySelector('button').setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
    document.body.style.overflowY = menuOpen && !isDesktop.matches ? 'hidden' : '';
    if (searchOpen) mobForm.querySelector('input').focus();
  };
  liSearch.addEventListener('click', () => setMobile(true, false));
  liCloseSearch.addEventListener('click', () => setMobile(false, false));
  liMenu.addEventListener('click', () => setMobile(false, true));
  liCloseMenu.addEventListener('click', () => setMobile(false, false));
  mobOverlay.addEventListener('click', () => setMobile(false, false));
  // collapse on escape / focus lost (stock header machinery)
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (openIndex >= 0) { const a = navItems[openIndex].querySelector('a'); closeMega(); if (a) a.focus(); }
    closeDropdowns();
    if (mobNav.classList.contains('is-open') || mobSearch.classList.contains('is-open')) { setMobile(false, false); liMenu.querySelector('button').focus(); }
  });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget) && e.relatedTarget) { closeMega(); closeDropdowns(); }
  });
  isDesktop.addEventListener('change', () => { closeMega(); setMobile(false, false); });

  block.replaceChildren(root);
}
