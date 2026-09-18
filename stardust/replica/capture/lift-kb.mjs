// Computed-style + geometry lift of a live sciex.com knowledge-base article (legacy globalpage template).
// usage: node stardust/replica/capture/lift-kb.mjs <width> <out.json>
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';

const W = Number(process.argv[2] || 1440);
const OUT = process.argv[3] || `stardust/replica/capture/tokens-kb-${W}.json`;
const URL = 'https://sciex.com/support/knowledge-base-articles/resetting-root-director-to-analyst-data-folder-restores-selexion-functionality-in-analyst_en_us';

const SELECTORS = {
  html: 'html', body: 'body', master: '#master', pageOuter: '#master > #page',
  headerXF: '.xf-header', headerCmp: '.cmp-experiencefragment--new-header1', headerbar: '.headerbar', headerPage: '.headerbar > #page', megaMenu: '#mega-menu',
  topBar: '#mega-menu > div:first-child', topBarContainer: '#mega-menu > div:first-child > .tw-container', logoLink: 'a[aria-label="Go to Sciex homepage"]',
  navRow: '#mega-menu .tw-bg-white.tw-relative.tw-z-\\[0\\]', navRowContainer: '#mega-menu .tw-bg-white.tw-relative.tw-z-\\[0\\] > .tw-container', desktopLinksLi: '.desktop-links > ul > li', desktopLinksA: '.desktop-links > ul > li > a',
  ruo: '#ruoNum-placeholder', fab: '#fab-component', walkme: '#walkme-player', qualtrics: '[id^="ZN_"]',
  section: '.sciex-section', homeSection: '.home-section', noBleed: '.home-section > .no-bleed', padFlex: '.no-bleed > .pad-bottom40.flex', padFlexW100: '.no-bleed > .pad-bottom40.flex > .w-100',
  breadcrumb: '.breadcrumb', cmpBreadcrumb: '.cmp-breadcrumb', bcMain: '.cmp-breadcrumb__main-content', bcList: '.cmp-breadcrumb__list', bcItem: '.cmp-breadcrumb__item', bcLink: '.cmp-breadcrumb__item-link', bcActive: '.cmp-breadcrumb__item--active', bcActiveText: '.cmp-breadcrumb__item-text', bcActiveLink: '.cmp-breadcrumb__item--active a',
  article: '.knowledgebasearticle', h1: '.knowledgebasearticle h1', h1sup: '.knowledgebasearticle h1 sup', hr: '.knowledgebasearticle > hr',
  row: '.knowledgebasearticle > .row', col8: '.knowledgebasearticle .col-xs-8', col4: '.knowledgebasearticle .col-xs-4', details: 'table.details', detailsTr: 'table.details tr', detailsTd: 'table.details td', detailsTdFirst: 'table.details td:first-child', detailsA: 'table.details a',
  avg: '.avgrating', avgI: '.avgrating i', avgBr: '.avgrating br',
  shadeBox: '.shade-box', utilities: '.utilities', share: '.article-share', addthis: '.addthis_sharing_toolbox', utilSpan: '.utilities > span:first-of-type', faPrint: '.fa-print', printA: '.utilities a', rate: '.rate', ratingStars: '.rating-stars', ratingI: '.rating-stars i', pin: '#kbarticlepin',
  bodyWrap: '.knowledgebasearticle > .shade-box + div', bodyInner: '.knowledgebasearticle > .shade-box + div > div', ruoP: '.knowledgebasearticle p[style]', ruoB: '.knowledgebasearticle p[style] b', bodyBrTop: '.knowledgebasearticle > .shade-box + div > div > br', bodyP: '.knowledgebasearticle > .shade-box + div > div > p:not([style])', bodySup: '.knowledgebasearticle > .shade-box + div > div > p sup', bodyPBr: '.knowledgebasearticle > .shade-box + div > div > p:not([style]) br',
  emptyRow: '.knowledgebasearticle > .row:empty', commentbtn: '.commentbtn', commentP: '.commentbtn p', commentBtn: '.commentbtn a.btn', newComments: '.new-comments', commentTemplate: '.comment-template',
  afterGrid: '.sciex-section + .responsivegrid', footerXF: '.xf-footer', footerCmp: '.cmp-experiencefragment--new-footer', sciexFooter: '.sciex-footer', supportBand: '.sciex-footer .tw-bg-grey-800', footerTw: '.sciex-footer > .clearfix > .tw', footer: 'footer', footerContainer: 'footer > .tw-container', footerTopRow: 'footer > .tw-container > div:first-child', socialUl: 'footer ul.tw-space-x-42', socialA: 'footer ul.tw-space-x-42 a', socialSvg: 'footer ul.tw-space-x-42 svg',
  langDesk: 'footer .tw-hidden.md\\:tw-flex', langDeskBtn: 'footer .tw-hidden.md\\:tw-flex button', langMob: 'footer .tw-flex.md\\:tw-hidden.tw-mt-32',
  linkNav: 'footer nav.tw-grid', linkColDesk: 'footer nav.tw-grid > div.md\\:tw-block', linkColHead: 'footer nav.tw-grid > div.md\\:tw-block > div', linkColUl: 'footer nav.tw-grid > div.md\\:tw-block ul', linkColLi: 'footer nav.tw-grid > div.md\\:tw-block li', linkColA: 'footer nav.tw-grid > div.md\\:tw-block a', linkColMob: 'footer nav.tw-grid > div.md\\:tw-hidden',
  legalBlock: 'footer .tw-pt-32.tw-pb-64', legalRow: 'footer .tw-pt-32.tw-pb-64 .md\\:tw-flex.tw-justify-between', copyright: 'footer .tw-pt-32.tw-pb-64 .md\\:tw-flex.tw-justify-between > span', legalA: 'footer .tw-pt-32.tw-pb-64 nav a',
  pgBtm: '.pg-btm', disclaimer: '#disclaimer', danaherImg: '.pg-btm img', lsig: '.lsig-banner', lsigLi: '.lsig-banner li', lsigA: '.lsig-banner a', lsigImg: '.lsig-banner img', lsigSvg: '.lsig-banner a > svg',
};

const PROPS = ['display','position','top','right','bottom','left','zIndex','width','height','minHeight','maxHeight','maxWidth','minWidth','marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopColor','borderBottomColor','borderTopStyle','borderBottomStyle','borderRadius','backgroundColor','backgroundImage','color','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','textTransform','textDecorationLine','textAlign','whiteSpace','opacity','boxShadow','gap','flexDirection','flexWrap','justifyContent','alignItems','float','clear','overflow','transform','textRendering','webkitFontSmoothing','fontSynthesis','fontVariantNumeric','fontKerning','fontVariationSettings','fontFeatureSettings','textWrap','wordBreak','verticalAlign','visibility','boxSizing','listStyleType','cursor','transitionProperty','transitionDuration','borderCollapse','borderSpacing','tableLayout','textIndent','wordSpacing'];

const browser = await chromium.launch();
const ctx = await newLiveContext(browser, { viewport: { width: W, height: 900 } });
const page = await ctx.newPage();
await gotoLive(page, URL, { waitUntil: 'domcontentloaded', timeoutMs: 90000, settleMs: 2500 });
const dismissed = await dismissOverlays(page, {});
await page.mouse.move(2, 2);
await page.waitForTimeout(800);
const preH = await page.evaluate(() => document.documentElement.scrollHeight);
await page.evaluate(async () => { const step = 600; for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
await page.waitForTimeout(800);
const scrolledState = await page.evaluate(() => { window.scrollTo(0, 600); return new Promise(r => setTimeout(() => {
  const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null; const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); return { cls: (el.className||'').toString().slice(0,120), position: cs.position, top: cs.top, transform: cs.transform, height: cs.height, rectTop: rc.top, display: cs.display, visibility: cs.visibility, bg: cs.backgroundColor }; };
  r({ scrollY: window.scrollY, htmlCls: document.documentElement.className, bodyCls: document.body.className, megaMenu: pick('#mega-menu'), headerbar: pick('.headerbar'), topBar: pick('#mega-menu > div:first-child'), navRow: pick('#mega-menu .tw-bg-white.tw-relative'), fab: pick('#fab-component'), walkme: pick('#walkme-player'), section: pick('.sciex-section') });
}, 700)); });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(700);
await page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important;}' });
await page.waitForTimeout(300);
await page.evaluate(() => document.fonts.ready);

const data = await page.evaluate(({ SELECTORS, PROPS }) => {
  const out = {}; const sy = window.scrollY;
  for (const [name, sel] of Object.entries(SELECTORS)) {
    let els; try { els = Array.from(document.querySelectorAll(sel)); } catch (e) { out[name] = { sel, error: String(e) }; continue; }
    out[name] = { sel, count: els.length, matches: els.slice(0, 6).map(el => {
      const cs = getComputedStyle(el); const rc = el.getBoundingClientRect();
      const st = {}; for (const p of PROPS) st[p] = cs[p];
      const m = { tag: el.tagName.toLowerCase(), cls: (el.getAttribute('class') || '').slice(0, 300), rect: { x: Math.round(rc.x * 100) / 100, y: Math.round((rc.y + sy) * 100) / 100, w: Math.round(rc.width * 100) / 100, h: Math.round(rc.height * 100) / 100 }, text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100), style: st };
      if (el.tagName === 'IMG') m.img = { src: el.currentSrc || el.src, natural: [el.naturalWidth, el.naturalHeight], complete: el.complete, alt: el.alt };
      const before = getComputedStyle(el, '::before'); const after = getComputedStyle(el, '::after');
      if (before.content !== 'none' && before.content !== 'normal') m.before = { content: before.content, display: before.display, w: before.width, h: before.height, font: before.font, color: before.color, margin: before.margin, position: before.position };
      if (after.content !== 'none' && after.content !== 'normal') m.after = { content: after.content, display: after.display, w: after.width, h: after.height, font: after.font, color: after.color, margin: after.margin, position: after.position };
      return m;
    }) };
  }
  out.__anchorsNoBleed = Array.from(document.querySelectorAll('.home-section > .no-bleed > *')).map(el => { const rc = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,60), y: Math.round(rc.y + sy), h: Math.round(rc.height) }; });
  out.__anchorsArticle = Array.from(document.querySelectorAll('.knowledgebasearticle > *')).map(el => { const rc = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,60), y: Math.round(rc.y + sy), h: Math.round(rc.height), display: cs.display, mt: cs.marginTop, mb: cs.marginBottom }; });
  out.__anchorsPage = Array.from(document.querySelectorAll('#master > #page > *')).map(el => { const rc = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,60), id: el.id, y: Math.round(rc.y + sy), h: Math.round(rc.height) }; });
  out.__doc = { scrollHeight: document.documentElement.scrollHeight, clientWidth: document.documentElement.clientWidth, innerWidth: window.innerWidth, bodyCls: document.body.className, htmlCls: document.documentElement.className, bodyStyleAttr: document.body.getAttribute('style') };
  const probe = (family, weight, size, text) => { const c = document.createElement('canvas').getContext('2d'); c.font = `${weight} ${size}px ${family}`; return c.measureText(text).width; };
  const T1 = 'Resetting Root Directory to Analyst Data Folder Restores Selexion DMS Functionality';
  const T2 = 'If a hardware profile won\'t activate when a Selexion Differential Mobility Spectrometer (DMS) is added, check to see that the root directory';
  const T3 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789';
  out.__textWidths = {};
  for (const fam of ['proxima-nova', 'Geogrotesque', 'Arial', 'Helvetica', 'Helvetica Neue', 'Verdana', 'Trebuchet MS', 'Montserrat', 'Nunito Sans', 'Avenir Next', 'Gill Sans']) for (const w of [300, 400, 700]) for (const [k, t] of Object.entries({ T1, T2, T3 })) out.__textWidths[`${fam}|${w}|${k}`] = probe(`"${fam}"`, w, 100, t);
  for (const w of [270, 330, 450, 530]) for (const [k, t] of Object.entries({ T1, T2, T3 })) out.__textWidths[`Geogrotesque|${w}|${k}`] = probe('Geogrotesque', w, 100, t);
  out.__fonts = Array.from(document.fonts).map(f => ({ family: f.family, weight: f.weight, style: f.style, status: f.status, src: (f._src||'') }));
  out.__fontFaceRules = [];
  for (const ss of Array.from(document.styleSheets)) { try { for (const r of Array.from(ss.cssRules)) if (r instanceof CSSFontFaceRule) out.__fontFaceRules.push({ href: ss.href, css: r.cssText.slice(0, 400) }); } catch (e) {} }
  // rendered-face check on inner spans: h1 text nodes vs sup
  out.__innerHTML = { h1: document.querySelector('.knowledgebasearticle h1')?.innerHTML, bodyInner: document.querySelector('.knowledgebasearticle > .shade-box + div > div')?.innerHTML, utilities: document.querySelector('.utilities')?.innerHTML.replace(/<script[\s\S]*?<\/script>/g,'<script/>').slice(0,3000), details: document.querySelector('table.details')?.innerHTML, commentbtn: document.querySelector('.commentbtn')?.innerHTML };
  // icons in article: fa glyph content
  out.__faGlyphs = Array.from(document.querySelectorAll('.knowledgebasearticle i.fa, .cmp-breadcrumb__item')).slice(0,14).map(el => { const b = getComputedStyle(el, '::before'); const a = getComputedStyle(el, '::after'); const rc = el.getBoundingClientRect(); return { cls: el.className, before: b.content, beforeFont: b.font, after: a.content, afterFont: a.font, w: rc.width, h: rc.height, color: getComputedStyle(el).color, fontSize: getComputedStyle(el).fontSize, fontFamily: getComputedStyle(el).fontFamily, lineHeight: getComputedStyle(el).lineHeight }; });
  out.__hidden = Array.from(document.querySelectorAll('.sciex-section [style*="display:none"], .sciex-section [style*="display: none"], .sciex-section .hidden')).map(el => ({ tag: el.tagName, cls: (el.className||'').toString().slice(0,80), id: el.id, text: el.textContent.trim().replace(/\s+/g,' ').slice(0,60) }));
  return out;
}, { SELECTORS, PROPS });

data.__meta = { width: W, url: URL, ts: new Date().toISOString(), dismissed, preSettleHeight: preH, scrolledState };
writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log('wrote', OUT, 'docH', data.__doc.scrollHeight, 'preSettle', preH);
console.log('page', JSON.stringify(data.__anchorsPage));
console.log('noBleed', JSON.stringify(data.__anchorsNoBleed));
console.log('article', JSON.stringify(data.__anchorsArticle));
console.log('scrolled', JSON.stringify(scrolledState).slice(0, 1500));
console.log('fonts', JSON.stringify(data.__fonts));
await browser.close();
