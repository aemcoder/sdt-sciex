// Computed-style + geometry lift of the live sciex.com home at one viewport width.
// usage: node stardust/replica/capture/lift.mjs <width> <out.json>
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';

const W = Number(process.argv[2] || 1440);
const OUT = process.argv[3] || `stardust/replica/capture/tokens-${W}.json`;
const URL = 'https://sciex.com/';

const SELECTORS = {
  html: 'html', body: 'body',
  headerXF: '.cmp-experiencefragment--header-v3', headerbar: '.headerbar', page: '#page', megaMenu: '#mega-menu',
  topBar: '#mega-menu > div:first-child', topBarContainer: '#mega-menu > div:first-child > .tw-container',
  logoLink: 'a[aria-label="Go to Sciex homepage"]', logoSvgDesktop: 'a[aria-label="Go to Sciex homepage"] svg.lg\\:tw-block', logoSvgMobile: 'a[aria-label="Go to Sciex homepage"] svg.lg\\:tw-hidden',
  mobileTopBar: '#mega-menu .lg\\:tw-hidden.tw-ml-auto', mobileTopBarUl: '#mega-menu .lg\\:tw-hidden.tw-ml-auto ul', mobileTopBarLi: '#mega-menu .lg\\:tw-hidden.tw-ml-auto li', mobileTopBarBtn: '#mega-menu .lg\\:tw-hidden.tw-ml-auto button', mobileTopBarSvg: '#mega-menu .lg\\:tw-hidden.tw-ml-auto svg',
  searchContainer: '.standalone-search-container', searchBox: '#standalone-search-box', searchDropdown: '.standalone-search-container .dropdown', dropbtn: '.standalone-search-container .dropbtn', dropbtnSvg: '.standalone-search-container .dropbtn svg', searchBtn: '.global-search-btn', searchBtnSvg: '.global-search-btn svg',
  rightBlock: '#mega-menu .lg\\:tw-absolute', rightUl: '#mega-menu .lg\\:tw-absolute > ul', loginLi: '#login', loginA: '#login > a', loginSvg: '#login > a svg', accountDropdown: '#accountDropdown', accountDropbtn: '#accountDropdown .dropbtn', accountDropbtnSvg: '#accountDropdown .dropbtn svg',
  shopLi: '#shop', shopA: '#shop > a', shopSvg: '#shop > a svg', rfqLi: '#request-a-quote', rfqA: '#request-a-quote > a', dashLi: '#request-a-quote + li', dashA: '#request-a-quote + li > a', dashInner: '#request-a-quote + li > a > div', dashSpan: '#request-a-quote + li > a span',
  navRow: '#mega-menu .tw-bg-white.tw-relative.tw-z-\\[0\\]', navRowContainer: '#mega-menu .tw-bg-white.tw-relative.tw-z-\\[0\\] > .tw-container', desktopLinks: '.desktop-links', desktopLinksUl: '.desktop-links > ul', desktopLinksLi: '.desktop-links > ul > li', desktopLinksA: '.desktop-links > ul > li > a', desktopLinksSvg: '.desktop-links > ul > li > a svg', desktopLinksSpan: '.desktop-links > ul > li > a > span',
  ruo: '#ruoNum-placeholder', fab: '#fab-component', walkme: '#walkme-player', qualtrics: '#ZN_1o1ioypsMWWxBmB', globalSuggestion: '#global-suggestion-popup',
  mainRoot: '#container-92f7fb6df7', mainGrid: '#container-92f7fb6df7 > .aem-Grid',
  heroCol: '.hero-small.aem-GridColumn', heroWrap: '.hero-small > div', hero: '#hero-small', heroInner: '#hero-small > div', heroImg: '#hero-small img', heroPicture: '#hero-small picture', heroOverlay: '#hero-small .overlay', heroContainer: '#hero-small .tw-container', heroFlex: '#hero-small .tw-container > div', heroCopy: '#hero-small .tw-container > div > div', heroH1: '#hero-small h1', heroLede: '#hero-small .atomic-richtext-content', heroLedeP: '#hero-small .atomic-richtext-content p', heroCtaRow: '#hero-small .md\\:tw-flex', heroCtaWrap: '#hero-small .md\\:tw-flex > div', heroCta: '#hero-small a', heroCtaInner: '#hero-small a > div', heroCtaSpan: '#hero-small a span', heroCtaSvg: '#hero-small a svg',
  mgCol: '.media-grid.aem-GridColumn', mgSection: '.media-grid section', mgContainer: '.media-grid .tw-container', mgFlex: '.media-grid .tw-container > div', mgItem: '.media-grid-item', mgItemA: '.media-grid-item > a', mgItemBox: '.media-grid-item > a > div', mgImg: '.media-grid-item img',
  tcCol: '.three-card.aem-GridColumn', tcSection: '#three-card', tcContainer: '#three-card .tw-container', tcGrid: '#three-card .tw-grid', tcCard: '#three-card .tw-grid > div', tcMedia: '#three-card .tw-grid > div > div:first-child', tcImg: '#three-card img', tcBody: '#three-card .tw-grid > div > div:last-child', tcTitle: '#three-card .text-lg-bolder', tcText: '#three-card .text-base', tcP: '#three-card .text-base p', tcB: '#three-card .text-base b', tcLink: '#three-card a.tw-inline-flex', tcLinkInner: '#three-card a.tw-inline-flex > div', tcLinkSpan: '#three-card a.tw-inline-flex > div > span:first-child', tcLinkUnderline: '#three-card a.tw-inline-flex span.tw-absolute', tcLinkSvg: '#three-card a.tw-inline-flex svg',
  tabCol: '.tab.aem-GridColumn', tabSection: '.tab.aem-GridColumn > section', tabFlexCol: '.tab.aem-GridColumn > section > div', tabHead: '.tab.aem-GridColumn .tw-container.tw-flex-col', tabHeadInner: '.tab.aem-GridColumn .tw-container.tw-flex-col > div', tabH2: '.tab.aem-GridColumn h2', tabLede: '.tab.aem-GridColumn p.text-lg', tabBar: '.tab.aem-GridColumn .tw-container.md\\:tw-flex', tabItem: '.tab.aem-GridColumn .tw-container.md\\:tw-flex > div', tabBtn: '.tab.aem-GridColumn .tw-container.md\\:tw-flex button', tabBtnSpan: '.tab.aem-GridColumn .tw-container.md\\:tw-flex button > span',
  tabMobBtn: '.tab.aem-GridColumn > section > div > button', tabMobBtnInner: '.tab.aem-GridColumn > section > div > button > div', tabMobBtnSpan: '.tab.aem-GridColumn > section > div > button span', tabMobBtnIconWrap: '.tab.aem-GridColumn > section > div > button > div > div', tabMobBtnSvg: '.tab.aem-GridColumn > section > div > button svg',
  tabPanelGrid: '#tabContent0', tabPanelGridWrap: '.tab.aem-GridColumn .tw-grid.tw-container', tabPanel: '#tabContent0 > div', tabPanelPic: '#tabContent0 picture', tabPanelImg: '#tabContent0 img', tabPanelText: '#tabContent0 > div > div', tabPanelH3: '#tabContent0 h3', tabPanelP: '#tabContent0 p', tabPanelLinkWrap: '#tabContent0 .tw-mt-12', tabPanelLink: '#tabContent0 a', tabPanelLinkInner: '#tabContent0 a > div', tabPanelLinkSpan: '#tabContent0 a > div > span:first-child', tabPanelLinkSvg: '#tabContent0 a svg',
  tabPanelGrid1: '#tabContent1', tabPanelGridWrap1: '#tabContent1', tabPanel1Parent: '.tab.aem-GridColumn .tw-grid-rows-\\[0fr\\]',
  icCol: '.icon-4-col.aem-GridColumn', icSection: '.icon-4-col section', icContainer: '.icon-4-col .tw-container', icHead: '.icon-4-col .tw-container > div:first-child', icH2: '.icon-4-col h2', icGrid: '.icon-4-col .tw-grid', icCard: '.icon-4-col .tw-grid > div', icIconWrap: '.icon-4-col .tw-grid > div > div:first-child', icSvg: '.icon-4-col .tw-grid > div > div:first-child svg', icH3: '.icon-4-col h3', icText: '.icon-4-col .text-base', icLinkWrap: '.icon-4-col .tw-mt-auto', icLink: '.icon-4-col a', icLinkInner: '.icon-4-col a > div', icLinkSpan: '.icon-4-col a > div > span:first-child', icLinkSvg: '.icon-4-col a svg',
  stCol: '.media-card-carousel.aem-GridColumn', stSection: '#splide01', stContainer: '#splide01 > .tw-container', stTrack: '#splide01-track', stHeadWrap: '#splide01-track > div:first-child', stHeadFlex: '#splide01-track > div:first-child > div', stHeadTitle: '#splide01-track > div:first-child > div > div:first-child', stH2: '#splide01 h2', stArrowsWrap: '#splide01-track > div:first-child > div > div:last-child', stArrows: '#splide01 .splide__arrows', stArrow: '#splide01 .splide__arrow', stPagination: '#splide01 .splide__pagination', stList: '#splide01-list', stSlide: '#splide01 .splide__slide', stSlideMedia: '#splide01 .splide__slide > div:first-child', stImg: '#splide01 img', stText: '#splide01 .media-card-text', stTitle: '#splide01 .media-card-text .text-lg-bolder', stBody: '#splide01 .media-card-text .text-base', stP: '#splide01 .media-card-text p', stLink: '#splide01 .media-card-text a', stLinkInner: '#splide01 .media-card-text a > div', stLinkSpan: '#splide01 .media-card-text a > div > span:first-child', stLinkSvg: '#splide01 .media-card-text a svg',
  footerXF: '.cmp-experiencefragment--footer-v3', sciexFooter: '.sciex-footer', supportBand: '.sciex-footer .tw-bg-grey-800', supportContainer: '.sciex-footer .tw-bg-grey-800 .tw-container', supportFlex: '.sciex-footer .tw-bg-grey-800 .tw-container > div', supportCopy: '.sciex-footer .tw-bg-grey-800 .tw-max-w-\\[620px\\]', supportH5a: '.sciex-footer .tw-bg-grey-800 h5:first-child', supportH5b: '.sciex-footer .tw-bg-grey-800 h5:last-child', supportCtaWrap: '.sciex-footer .tw-bg-grey-800 .tw-justify-center', supportCta: '.sciex-footer .tw-bg-grey-800 a', supportCtaInner: '.sciex-footer .tw-bg-grey-800 a > div', supportCtaSpan: '.sciex-footer .tw-bg-grey-800 a span', supportCtaSvg: '.sciex-footer .tw-bg-grey-800 a svg',
  footerTw: '.sciex-footer > .tw', footer: '#footer', footerContainer: '#footer > .tw-container', footerTopRow: '#footer > .tw-container > div:first-child', socialNav: '#footer > .tw-container > div:first-child > nav', socialUl: '#footer ul.tw-space-x-42', socialLi: '#footer ul.tw-space-x-42 > li', socialA: '#footer ul.tw-space-x-42 a', socialSvg: '#footer ul.tw-space-x-42 svg',
  langDesk: '#footer .tw-hidden.md\\:tw-flex', langDeskBtn: '#footer .tw-hidden.md\\:tw-flex button', langDeskImg: '#footer .tw-hidden.md\\:tw-flex img', langDeskTextWrap: '#footer .tw-hidden.md\\:tw-flex .tw-ml-3', langDeskSpan: '#footer .tw-hidden.md\\:tw-flex span', langDeskSvg: '#footer .tw-hidden.md\\:tw-flex svg',
  langMob: '#footer .tw-flex.md\\:tw-hidden.tw-mt-32', langMobBtn: '#footer .tw-flex.md\\:tw-hidden.tw-mt-32 button', langMobImg: '#footer .tw-flex.md\\:tw-hidden.tw-mt-32 img', langMobSpan: '#footer .tw-flex.md\\:tw-hidden.tw-mt-32 span', langMobSvg: '#footer .tw-flex.md\\:tw-hidden.tw-mt-32 svg',
  linkNav: '#footer nav.tw-grid', linkColDesk: '#footer nav.tw-grid > div.md\\:tw-block', linkColHead: '#footer nav.tw-grid > div.md\\:tw-block > div', linkColUl: '#footer nav.tw-grid > div.md\\:tw-block ul', linkColLi: '#footer nav.tw-grid > div.md\\:tw-block li', linkColA: '#footer nav.tw-grid > div.md\\:tw-block a',
  linkColMob: '#footer nav.tw-grid > div.md\\:tw-hidden', linkColMobBtn: '#footer nav.tw-grid > div.md\\:tw-hidden button', linkColMobBtnSpan: '#footer nav.tw-grid > div.md\\:tw-hidden button > span', linkColMobSvg: '#footer nav.tw-grid > div.md\\:tw-hidden button svg', linkColMobUl: '#footer nav.tw-grid > div.md\\:tw-hidden ul', linkColMobLi: '#footer nav.tw-grid > div.md\\:tw-hidden li', linkColMobA: '#footer nav.tw-grid > div.md\\:tw-hidden a',
  legalBlock: '#footer .tw-pt-32.tw-pb-64', legalContainer: '#footer .tw-pt-32.tw-pb-64 > .tw-container', legalRow: '#footer .tw-pt-32.tw-pb-64 .md\\:tw-flex.tw-justify-between', copyright: '#footer .tw-pt-32.tw-pb-64 .md\\:tw-flex.tw-justify-between > span', legalNav: '#footer .tw-pt-32.tw-pb-64 nav', legalUl: '#footer .tw-pt-32.tw-pb-64 nav ul', legalLi: '#footer .tw-pt-32.tw-pb-64 nav li', legalA: '#footer .tw-pt-32.tw-pb-64 nav a',
  pgBtm: '.pg-btm', disclaimer: '#disclaimer', disclaimerSup: '#disclaimer sup', disclaimerSpan: '#disclaimer span', danaherP: '.pg-btm > p:last-child', danaherPic: '.pg-btm picture', danaherImg: '.pg-btm img',
  lsig: '.lsig-banner', lsigUl: '.lsig-banner ul', lsigLi: '.lsig-banner li', lsigA: '.lsig-banner a', lsigSvg: '.lsig-banner a > svg', lsigImg: '.lsig-banner img',
  langModal: '#footer .tw-fixed.tw-bottom-10',
};

const PROPS = ['display','position','top','right','bottom','left','zIndex','width','height','minHeight','maxHeight','maxWidth','minWidth','marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopColor','borderBottomColor','borderLeftColor','borderRightColor','borderRadius','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat','color','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','textTransform','textDecorationLine','textAlign','whiteSpace','opacity','boxShadow','gap','columnGap','rowGap','flexDirection','flexWrap','justifyContent','alignItems','alignSelf','flexGrow','flexShrink','flexBasis','gridTemplateColumns','gridTemplateRows','gridAutoFlow','aspectRatio','objectFit','objectPosition','overflow','overflowX','overflowY','transform','textRendering','webkitFontSmoothing','fontSynthesis','fontVariantNumeric','fontKerning','fontVariationSettings','fontFeatureSettings','textWrap','wordBreak','overflowWrap','verticalAlign','order','visibility','boxSizing','listStyleType','textOverflow','webkitLineClamp','fill','stroke','strokeWidth','cursor','outline','transitionProperty','transitionDuration','float','clear'];

const browser = await chromium.launch();
const ctx = await newLiveContext(browser, { viewport: { width: W, height: 900 } });
const page = await ctx.newPage();
await gotoLive(page, URL, { waitUntil: 'domcontentloaded', timeoutMs: 90000, settleMs: 2500 });
const dismissed = await dismissOverlays(page, {});
await page.mouse.move(2, 2);
await page.waitForTimeout(800);
// slow-scroll settle
const preH = await page.evaluate(() => document.documentElement.scrollHeight);
await page.evaluate(async () => { const step = 600; for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
await page.waitForTimeout(800);
// scroll-state observation at y=600 (header morph?)
const scrolledState = await page.evaluate(() => {
  window.scrollTo(0, 600);
  return new Promise(r => setTimeout(() => {
    const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null; const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); return { cls: el.className, position: cs.position, top: cs.top, transform: cs.transform, height: cs.height, rectTop: rc.top, rectH: rc.height, display: cs.display, visibility: cs.visibility, bg: cs.backgroundColor }; };
    r({ scrollY: window.scrollY, htmlCls: document.documentElement.className, bodyCls: document.body.className, megaMenu: pick('#mega-menu'), headerbar: pick('.headerbar'), page: pick('#page'), headerXF: pick('.cmp-experiencefragment--header-v3'), topBar: pick('#mega-menu > div:first-child'), navRow: pick('#mega-menu .tw-bg-white.tw-relative'), fab: pick('#fab-component'), walkme: pick('#walkme-player') });
  }, 700));
});
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(700);
await page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important;}' });
await page.waitForTimeout(300);

const data = await page.evaluate(({ SELECTORS, PROPS }) => {
  const out = {};
  const sy = window.scrollY;
  for (const [name, sel] of Object.entries(SELECTORS)) {
    let els; try { els = Array.from(document.querySelectorAll(sel)); } catch (e) { out[name] = { sel, error: String(e) }; continue; }
    out[name] = { sel, count: els.length, matches: els.slice(0, 4).map(el => {
      const cs = getComputedStyle(el); const rc = el.getBoundingClientRect();
      const st = {}; for (const p of PROPS) st[p] = cs[p];
      const m = { tag: el.tagName.toLowerCase(), cls: (el.getAttribute('class') || '').slice(0, 300), rect: { x: Math.round(rc.x * 100) / 100, y: Math.round((rc.y + sy) * 100) / 100, w: Math.round(rc.width * 100) / 100, h: Math.round(rc.height * 100) / 100 }, text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80), style: st };
      if (el.tagName === 'IMG') { m.img = { src: el.currentSrc || el.src, natural: [el.naturalWidth, el.naturalHeight], complete: el.complete, alt: el.alt }; }
      const before = getComputedStyle(el, '::before'); const after = getComputedStyle(el, '::after');
      if (before.content !== 'none' && before.content !== 'normal') m.before = { content: before.content, display: before.display, w: before.width, h: before.height, bg: before.backgroundColor, bgImage: before.backgroundImage, position: before.position };
      if (after.content !== 'none' && after.content !== 'normal') m.after = { content: after.content, display: after.display, w: after.width, h: after.height, bg: after.backgroundColor, bgImage: after.backgroundImage, position: after.position };
      return m;
    }) };
  }
  // top-level section anchors under main root
  out.__anchors = Array.from(document.querySelectorAll('#container-92f7fb6df7 > .aem-Grid > div')).map(el => { const rc = el.getBoundingClientRect(); return { cls: el.className.split(' ')[0], y: Math.round(rc.y + sy), h: Math.round(rc.height) }; });
  out.__doc = { scrollHeight: document.documentElement.scrollHeight, clientWidth: document.documentElement.clientWidth, innerWidth: window.innerWidth, bodyCls: document.body.className, htmlCls: document.documentElement.className };
  // text width probes (font metric matching)
  const probe = (family, weight, size, text) => { const c = document.createElement('canvas').getContext('2d'); c.font = `${weight} ${size}px ${family}`; return c.measureText(text).width; };
  const T1 = 'The leader in mass spectrometry and capillary electrophoresis solutions';
  const T2 = 'Providing the precision detection and quantitation of molecules needed for scientists to make discoveries that change the world.';
  const T3 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789';
  out.__textWidths = {};
  for (const w of [200, 270, 300, 330, 450, 530, 700]) for (const [k, t] of Object.entries({ T1, T2, T3 })) out.__textWidths[`geo-${w}-${k}`] = probe('Geogrotesque', w, 100, t);
  for (const [k, t] of Object.entries({ T1, T2, T3 })) out.__textWidths[`arial-400-${k}`] = probe('Arial', 400, 100, t);
  out.__fonts = Array.from(document.fonts).map(f => ({ family: f.family, weight: f.weight, style: f.style, status: f.status }));
  // hidden-but-present inventory in main root (for granularity parity)
  out.__mainHidden = Array.from(document.querySelectorAll('#container-92f7fb6df7 [aria-hidden="true"], #container-92f7fb6df7 .tw-hidden')).map(el => ({ tag: el.tagName, cls: (el.className||'').slice(0,80), text: el.textContent.trim().replace(/\s+/g,' ').slice(0,60), display: getComputedStyle(el).display }));
  return out;
}, { SELECTORS, PROPS });

data.__meta = { width: W, url: URL, ts: new Date().toISOString(), dismissed, preSettleHeight: preH, scrolledState };
writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log('wrote', OUT, 'docH', data.__doc.scrollHeight, 'preSettle', preH, 'sections', JSON.stringify(data.__anchors));
console.log('scrolled', JSON.stringify(scrolledState).slice(0, 1200));
console.log('fonts', JSON.stringify(data.__fonts));
await browser.close();
