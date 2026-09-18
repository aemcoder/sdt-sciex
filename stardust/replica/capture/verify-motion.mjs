import { chromium } from 'playwright';
const b = await chromium.launch(); const errors = [];
const snap = (p, sels) => p.evaluate((sels) => sels.map(s => Array.from(document.querySelectorAll(s)).slice(0, 8).map(el => { const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); return { s, cls: el.className.toString().slice(0, 80), display: cs.display, rect: [Math.round(rc.x), Math.round(rc.y + scrollY), Math.round(rc.width), Math.round(rc.height)], transform: cs.transform, bb: cs.borderBottomColor, maxH: cs.maxHeight, op: cs.opacity, style: el.getAttribute('style') || '', text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 30), disabled: el.disabled }; })), sels);
async function run(W, steps) {
  const p = await b.newPage({ viewport: { width: W, height: 900 } }); p.on('pageerror', e => errors.push(W + ': ' + e.message));
  await p.goto('http://localhost:8795/home-proposed.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
  for (const [click, watch] of steps) {
    const before = await snap(p, watch);
    await p.locator(click).first().click({ force: true }); await p.waitForTimeout(900);
    const after = await snap(p, watch);
    console.log(`\n[${W}] click ${click}`);
    watch.forEach((s, i) => after[i].forEach((a, k) => { const bf = before[i][k]; const ch = {}; if (bf) for (const key of Object.keys(a)) if (JSON.stringify(a[key]) !== JSON.stringify(bf[key])) ch[key] = [bf[key], a[key]]; if (!bf || Object.keys(ch).length) console.log('  ', s, k, a.text, JSON.stringify(bf ? ch : a).slice(0, 260)); }));
  }
  await p.close();
}
await run(1440, [
  ['.hdr-nav__row > ul > li:first-child > a', ['.hdr-nav__row > ul > li', '.hdr-nav__row > ul > li > a > span', '.hdr-overlay', '.hdr-mega__close', '.hdr-mega__menu.is-open .hdr-mega__panel.is-open .hdr-mega__sub', '.tabs__bar > div', '.hdr-mega']],
  ['.hdr-mega__menu.is-open .hdr-mega__sub[data-sub="2"]', ['.hdr-mega__menu.is-open .hdr-mega__panel.is-open .hdr-mega__viewall', '.hdr-mega__menu.is-open .hdr-mega__panel']],
  ['.hdr-nav__row > ul > li:first-child > a', ['.hdr-nav__row > ul > li', '.hdr-overlay', '.hdr-mega__close', '.tabs__bar > div']],
  ['#accountDropdown .hdr-dropbtn', ['.hdr-dropdown__content--account']],
  ['.hdr-search .hdr-dropbtn', ['.hdr-dropdown__content', '.hdr-dropdown__content--account']],
  ['.tabs__bar button[data-tab="2"]', ['.hdr-dropdown__content', '.tabs__bar > div', '.tabs__panel-grid']],
]);
await run(360, [
  ['.stories__arrow--next', ['#splide01-list', '.stories__slide', '.stories__arrow', '.stories__pagination button']],
  ['.stories__arrow--prev', ['#splide01-list', '.stories__slide', '.stories__arrow']],
  ['.ftr-col--mobile > button', ['.ftr-col--mobile ul', '.ftr-col--mobile button svg']],
  ['.ftr-lang--mobile button', ['.lang-modal']],
  ['.lang-modal__scrim', ['.lang-modal']],
  ['.hdr-mobile-actions [data-action="menu"] button', ['.hdr-mob-nav', '.hdr-mobile-actions li', '.hdr-mob-overlay']],
  ['.hdr-mobile-actions [data-action="search"] button', ['.hdr-mob-nav', '.hdr-mob-search', '.hdr-mobile-actions li']],
]);
console.log('\npageerrors:', errors); await b.close();
