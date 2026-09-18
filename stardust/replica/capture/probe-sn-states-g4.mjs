// /support interaction states: sidebar mini toggle geometry, image-map hover swap, stuck bar geometry.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';
const browser = await chromium.launch(); const ctx = await newLiveContext(browser, { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage(); await gotoLive(page, 'https://sciex.com/support', { waitUntil: 'domcontentloaded', timeoutMs: 90000, settleMs: 2500 });
await dismissOverlays(page, {}); await page.mouse.move(2, 2); await page.waitForTimeout(500);
const PROPS = ['display','position','top','left','right','width','maxWidth','minWidth','height','paddingTop','paddingLeft','paddingRight','marginLeft','marginRight','overflowX','opacity','transition','transform','backgroundColor','color','fontSize','whiteSpace','textIndent','visibility','zIndex'];
const snap = (label) => page.evaluate(({ PROPS, label }) => { const sy = window.scrollY; const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null; const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); const o = { cls: (el.className||'').toString().slice(0,200), rect: { x: +rc.x.toFixed(1), y: +(rc.y+sy).toFixed(1), w: +rc.width.toFixed(1), h: +rc.height.toFixed(1) } }; for (const p of PROPS) o[p] = cs[p]; return o; };
  return { label, scrollY: sy, bodyCls: document.body.className, docH: document.documentElement.scrollHeight,
    header: pick('header#js-header'), headerSection: pick('header#js-header .u-header__section'), navbar: pick('header#js-header nav'), brandBox: pick('.u-header-logo-toggler'), brand: pick('a.navbar-brand'), logo: pick('img.u-header-logo'), toggler: pick('a.js-side-nav'), togglerIcon: pick('a.js-side-nav i'),
    aside: pick('aside.sidebar-wrapper'), asideInner: pick('aside.sidebar-wrapper > div'), searchSection: pick('.sidebar-searchbox'), searchForm: pick('.u-header--search'), helpBtn: pick('.help-btn'), navUl: pick('ul.u-sidebar-navigation-v1-menu'), navHeader: pick('li.sidebar-header'), navLink: pick('a.u-side-nav--top-level-menu-link'), navIcon: pick('a.u-side-nav--top-level-menu-link > span:first-child'), navLabel: pick('span.nav-link'), navCtl: pick('span.u-side-nav--control-icon'),
    mainBody: pick('.main-body'), pad: pick('.main-body > .g-px-20'), noBleed: pick('.main-body .no-bleed'), section: pick('.main-body .sciex-section'),
    imgs: Array.from(document.querySelectorAll('img.imgHover')).map(i => ({ id: i.id, display: getComputedStyle(i).display, opacity: getComputedStyle(i).opacity })), igText: document.querySelector('#ig-text') ? document.querySelector('#ig-text').innerHTML.replace(/\s+/g,' ').slice(0,300) : null };
}, { PROPS, label });
const out = {}; out.initial = await snap('initial');
// area hover swap
const area2 = await page.$('area.map2'); const igImg = await page.$('#img-hover-1'); const ib = await igImg.boundingBox();
// map2 coords 187,0,420,121 relative to image (1000 wide scaled from 1140): scale
const sc = ib.width / 1140; await page.mouse.move(ib.x + (187+420)/2*sc, ib.y + 60*sc); await page.waitForTimeout(700); out.hoverMap2 = await snap('hover map2');
await page.mouse.move(ib.x + 65*sc, ib.y + 60*sc); await page.waitForTimeout(700); out.hoverMap7 = await snap('hover map7');
await page.mouse.move(2, 2); await page.waitForTimeout(900); out.afterLeave = await snap('after leave');
// sidebar link hover: sub colors
const link = await page.$('a.u-side-nav--top-level-menu-link'); await link.hover(); await page.waitForTimeout(500);
out.linkHover = await page.evaluate(() => { const a = document.querySelector('a.u-side-nav--top-level-menu-link'); return Array.from(a.querySelectorAll('span, i')).map(el => ({ cls: el.className.slice(0,60), color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor, transition: getComputedStyle(el).transition })).concat([{ cls: 'A', color: getComputedStyle(a).color, bg: getComputedStyle(a).backgroundColor, transition: getComputedStyle(a).transition }]); });
await page.mouse.move(2, 2); await page.waitForTimeout(500);
// toggler click → mini state
await page.click('a.js-side-nav'); await page.waitForTimeout(1200); out.mini = await snap('mini');
out.miniLinkHover = null; const l2 = await page.$('a.u-side-nav--top-level-menu-link'); await l2.hover(); await page.waitForTimeout(600); out.miniHover = await snap('mini hover');
await page.mouse.move(2, 2); await page.waitForTimeout(500); await page.click('a.js-side-nav'); await page.waitForTimeout(1200); out.restored = await snap('restored');
// stuck bar geometry
await page.evaluate(() => window.scrollTo(0, 900)); await page.waitForTimeout(700); out.stuck = await snap('stuck@900');
writeFileSync('stardust/replica/capture/states-g4-support-1440.json', JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) { if (v && v.header) console.log(k, 'bodyCls', v.bodyCls, '| header', v.header.position, JSON.stringify(v.header.rect), '| aside', JSON.stringify(v.aside && v.aside.rect), v.aside && v.aside.cls.slice(0,80), '| mainBody', JSON.stringify(v.mainBody.rect), v.mainBody.maxWidth, v.mainBody.marginLeft, '| imgs', JSON.stringify(v.imgs.filter(i => i.display !== 'none').map(i => i.id)), '| label', v.navLabel && v.navLabel.display, v.navLabel && v.navLabel.width, '| brandBox', JSON.stringify(v.brandBox && v.brandBox.rect), '| logo', v.logo && v.logo.display); }
console.log('linkHover', JSON.stringify(out.linkHover));
await browser.close();
