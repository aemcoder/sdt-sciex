// G4 legacy-template lift: full content-root tree dump (computed styles + pseudo glyphs + rects) + chrome
// selectors + fonts + text-width probes; --harvest saves the page's own images / icon fonts through the
// page session (CDN-authorised) into stardust/prototypes/assets/media/g4/ and assets/fonts/.
// usage: node stardust/replica/capture/lift-g4.mjs <slug> <width> [--harvest]
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';

const SLUG = process.argv[2]; const W = Number(process.argv[3] || 1440); const HARVEST = process.argv.includes('--harvest');
const PAGES = {
  'support': { url: 'https://sciex.com/support', root: 'main' },
  'support-software-support': { url: 'https://sciex.com/support/software-support', root: '#page > .responsivegrid' },
  'education-grant-support': { url: 'https://sciex.com/education/grant-support', root: '#page > .responsivegrid' },
};
const P = PAGES[SLUG]; if (!P) { console.error('unknown slug'); process.exit(1); }
const OUT = `stardust/replica/capture/tokens-g4-${SLUG}-${W}.json`;
const MEDIA_DIR = 'stardust/prototypes/assets/media/g4'; const FONT_DIR = 'stardust/prototypes/assets/fonts';

const CHROME = {
  html: 'html', body: 'body', master: '#master', page: '#page', headerXF: '.xf-header', headerbar: '.headerbar', megaMenu: '#mega-menu',
  footerXF: '.xf-footer', footerCmp: '.cmp-experiencefragment--new-footer', sciexFooter: '.sciex-footer', footer: 'footer', footerContainer: 'footer > .tw-container',
  walkme: '#walkme-player', qualtrics: '[id^="ZN_"]', fab: '#fab-component', ruo: '#ruoNum-placeholder', afterRoot: `${P.root} ~ *`,
};
const PROPS = ['display','position','top','right','bottom','left','zIndex','float','clear','width','height','minHeight','maxHeight','maxWidth','minWidth','boxSizing','marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','borderTopStyle','borderBottomStyle','borderLeftStyle','borderRightStyle','borderRadius','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat','color','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','textAlign','textTransform','textDecorationLine','textOverflow','whiteSpace','verticalAlign','wordSpacing','textRendering','webkitFontSmoothing','fontVariationSettings','fontSynthesis','fontKerning','listStyleType','listStylePosition','opacity','overflowX','overflowY','visibility','flexDirection','flexWrap','flexGrow','flexShrink','flexBasis','justifyContent','alignItems','alignSelf','alignContent','gap','columnGap','rowGap','gridTemplateColumns','order','objectFit','boxShadow','transform','transition','cursor','outlineStyle','appearance','borderCollapse','tableLayout','textShadow','filter','mixBlendMode','textIndent','webkitLineClamp','pointerEvents','aspectRatio'];

const browser = await chromium.launch();
const ctx = await newLiveContext(browser, { viewport: { width: W, height: 900 } });
const page = await ctx.newPage();
const responses = new Map();
page.on('response', async (r) => { try { const u = r.url(); const ct = r.headers()['content-type'] || ''; if (/image|font|octet/.test(ct) || /\.(png|jpe?g|svg|webp|gif|woff2?|ttf|mp4)(\?|$)/i.test(u)) { responses.set(u, { status: r.status(), ct }); } } catch (e) {} });
await gotoLive(page, P.url, { waitUntil: 'domcontentloaded', timeoutMs: 90000, settleMs: 2500 });
const dismissed = await dismissOverlays(page, {});
await page.mouse.move(2, 2); await page.waitForTimeout(800);
const preH = await page.evaluate(() => document.documentElement.scrollHeight);
await page.evaluate(async () => { const step = 600; for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
await page.waitForTimeout(800);
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(700);
await page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important;}' });
await page.waitForTimeout(300); await page.evaluate(() => document.fonts.ready);

const data = await page.evaluate(({ CHROME, PROPS, root }) => {
  const sy = window.scrollY; const out = {};
  const styleOf = (el) => { const cs = getComputedStyle(el); const st = {}; for (const p of PROPS) st[p] = cs[p]; return st; };
  const pseudo = (el, which) => { const ps = getComputedStyle(el, which); if (!ps.content || ps.content === 'none' || ps.content === 'normal') return null; return { content: ps.content, display: ps.display, font: ps.font, fontFamily: ps.fontFamily, fontSize: ps.fontSize, color: ps.color, w: ps.width, h: ps.height, position: ps.position, top: ps.top, right: ps.right, left: ps.left, bottom: ps.bottom, margin: ps.margin, padding: ps.padding, background: ps.background, backgroundColor: ps.backgroundColor, border: ps.border, transform: ps.transform, lineHeight: ps.lineHeight, verticalAlign: ps.verticalAlign, opacity: ps.opacity, zIndex: ps.zIndex }; };
  const rectOf = (el) => { const rc = el.getBoundingClientRect(); return { x: +rc.x.toFixed(1), y: +(rc.y + sy).toFixed(1), w: +rc.width.toFixed(1), h: +rc.height.toFixed(1) }; };
  // chrome selectors
  for (const [name, sel] of Object.entries(CHROME)) { let els; try { els = Array.from(document.querySelectorAll(sel)); } catch (e) { out[name] = { sel, error: String(e) }; continue; } out[name] = { sel, count: els.length, matches: els.slice(0, 4).map(el => ({ tag: el.tagName.toLowerCase(), id: el.id, cls: (el.className || '').toString().slice(0, 160), rect: rectOf(el), style: styleOf(el) })) }; }
  // full tree of the content root
  const rootEl = document.querySelector(root); const tree = []; let n = 0;
  const walk = (el, depth, path) => {
    if (n > 2500) return; n += 1;
    const tag = el.tagName.toLowerCase();
    const node = { i: tree.length, path, depth, tag, id: el.id || undefined, cls: (el.getAttribute('class') || '') || undefined, rect: rectOf(el), style: styleOf(el) };
    const own = Array.from(el.childNodes).filter(c => c.nodeType === 3 && c.textContent.trim()).map(c => c.textContent.replace(/\s+/g, ' ').trim()); if (own.length) node.text = own.join(' / ').slice(0, 160);
    const attrs = {}; for (const a of ['href', 'src', 'alt', 'style', 'type', 'placeholder', 'target', 'value', 'name', 'poster', 'title', 'aria-label', 'role', 'data-src', 'srcset', 'coords', 'shape', 'usemap']) if (el.hasAttribute(a)) attrs[a] = el.getAttribute(a).slice(0, 300); if (Object.keys(attrs).length) node.attrs = attrs;
    const b = pseudo(el, '::before'), a = pseudo(el, '::after'); if (b) node.before = b; if (a) node.after = a;
    if (tag === 'img') { node.img = { naturalWidth: el.naturalWidth, naturalHeight: el.naturalHeight, complete: el.complete, currentSrc: el.currentSrc }; }
    if (tag === 'video') { node.video = { videoWidth: el.videoWidth, videoHeight: el.videoHeight, readyState: el.readyState, poster: el.poster, currentSrc: el.currentSrc, duration: el.duration, paused: el.paused, controls: el.controls, error: el.error && el.error.code }; }
    if (tag === 'input' || tag === 'button' || tag === 'select' || tag === 'textarea') { const ph = getComputedStyle(el, '::placeholder'); node.placeholderStyle = { color: ph.color, fontSize: ph.fontSize, fontFamily: ph.fontFamily, fontWeight: ph.fontWeight, opacity: ph.opacity, fontStyle: ph.fontStyle }; }
    if (tag === 'svg') { node.svg = el.outerHTML.slice(0, 6000); return tree.push(node); }
    if (tag === 'iframe') { node.iframe = { src: el.src, w: el.width, h: el.height }; }
    tree.push(node);
    let k = 0; for (const ch of el.children) { walk(ch, depth + 1, `${path}/${k}`); k += 1; }
  };
  if (rootEl) walk(rootEl, 0, '0'); out.__tree = tree; out.__treeCount = n;
  out.__rootInner = rootEl ? rootEl.innerHTML.replace(/<script[\s\S]*?<\/script>/g, '<!--script-->').slice(0, 900000) : null;
  out.__doc = { scrollHeight: document.documentElement.scrollHeight, clientWidth: document.documentElement.clientWidth, innerWidth: window.innerWidth, bodyCls: document.body.className, htmlCls: document.documentElement.className, bodyStyleAttr: document.body.getAttribute('style'), htmlFontSize: getComputedStyle(document.documentElement).fontSize, bodyFont: getComputedStyle(document.body).font, bodyColor: getComputedStyle(document.body).color, bodyBg: getComputedStyle(document.body).backgroundColor, rootRect: rootEl ? rectOf(rootEl) : null };
  out.__pageChildren = Array.from(document.querySelectorAll('#master > #page > *')).map(el => ({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 80), id: el.id, rect: rectOf(el), display: getComputedStyle(el).display }));
  const probe = (family, weight, size, text) => { const c = document.createElement('canvas').getContext('2d'); c.font = `${weight} ${size}px ${family}`; return +c.measureText(text).width.toFixed(2); };
  const T3 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789'; const T1 = 'You have CE, LC, mass spec questions? SCIEX has the answers.'; const T2 = 'Get the most from your SCIEX software with application support, for optimal results.';
  out.__textWidths = {};
  for (const fam of ['proxima-nova', 'Geogrotesque', 'Helvetica', 'Arial', 'Helvetica Neue', 'Verdana', 'Montserrat', 'Nunito Sans', 'Avenir Next', 'Gill Sans', 'Trebuchet MS', 'Segoe UI', 'Lato', 'Source Sans Pro', 'Open Sans', 'Roboto', 'Raleway', 'Futura', 'Century Gothic', 'Avenir', 'Tahoma', 'Optima', 'Mulish', 'Figtree', 'Poppins', 'Inter']) for (const w of [300, 400, 500, 600, 700]) for (const [k, t] of Object.entries({ T1, T2, T3 })) out.__textWidths[`${fam}|${w}|${k}`] = probe(`"${fam}"`, w, 100, t);
  out.__fonts = Array.from(document.fonts).map(f => ({ family: f.family, weight: f.weight, style: f.style, status: f.status }));
  out.__fontFaceRules = []; for (const ss of Array.from(document.styleSheets)) { try { for (const r of Array.from(ss.cssRules)) if (r instanceof CSSFontFaceRule) out.__fontFaceRules.push({ href: ss.href, css: r.cssText.slice(0, 500) }); } catch (e) {} }
  out.__sheets = Array.from(document.styleSheets).map(s => s.href).filter(Boolean);
  // media urls inside root: img src + background-image urls
  const media = new Set(); if (rootEl) { for (const im of rootEl.querySelectorAll('img')) if (im.currentSrc || im.src) media.add(im.currentSrc || im.src); for (const el of rootEl.querySelectorAll('*')) { const bg = getComputedStyle(el).backgroundImage; const m = bg && bg.match(/url\("?([^")]+)"?\)/g); if (m) for (const u of m) media.add(u.replace(/^url\("?/, '').replace(/"?\)$/, '')); const b = getComputedStyle(el, '::before').backgroundImage; const mb = b && b.match(/url\("?([^")]+)"?\)/); if (mb) media.add(mb[1]); } }
  out.__mediaUrls = Array.from(media);
  // video frame readback attempt
  const v = rootEl && rootEl.querySelector('video'); if (v) { try { const c = document.createElement('canvas'); c.width = v.videoWidth || 320; c.height = v.videoHeight || 180; c.getContext('2d').drawImage(v, 0, 0); out.__videoFrame = c.toDataURL('image/png').slice(0, 200000); } catch (e) { out.__videoFrame = 'ERR ' + String(e); } }
  return out;
}, { CHROME, PROPS, root: P.root });

data.__meta = { slug: SLUG, width: W, url: P.url, root: P.root, ts: new Date().toISOString(), dismissed, preSettleHeight: preH };
data.__responses = Array.from(responses.entries()).map(([u, v]) => ({ u, ...v }));

if (HARVEST) {
  mkdirSync(MEDIA_DIR, { recursive: true });
  const saved = [];
  const fontUrls = data.__fontFaceRules.flatMap(r => { const m = r.css.match(/url\("?([^")]+)"?\)/g) || []; return m.map(u => u.replace(/^url\("?/, '').replace(/"?\)$/, '')); }).filter(u => /hs-admin-icons\.woff$|glyphicons-halflings-regular\.woff$|hs-icons\.woff|Simple-Line-Icons\.woff2/.test(u));
  const targets = [...data.__mediaUrls.map(u => ({ u, dir: MEDIA_DIR })), ...fontUrls.map(u => ({ u, dir: FONT_DIR }))];
  for (const { u, dir } of targets) {
    try {
      const abs = new URL(u, P.url).href; if (!/^https?:/.test(abs) || /typekit/.test(abs)) continue;
      const name = decodeURIComponent(abs.split('/').pop().split('?')[0]).replace(/[^A-Za-z0-9._-]/g, '_'); const dest = `${dir}/${name}`;
      if (existsSync(dest)) { saved.push({ u: abs, dest, skipped: true }); continue; }
      const r = await ctx.request.get(abs, { timeout: 30000 }); if (!r.ok()) { saved.push({ u: abs, status: r.status() }); continue; }
      writeFileSync(dest, await r.body()); saved.push({ u: abs, dest, bytes: (await r.body()).length });
    } catch (e) { saved.push({ u, error: String(e).slice(0, 120) }); }
  }
  data.__harvest = saved;
  if (data.__videoFrame && data.__videoFrame.startsWith('data:image/png')) writeFileSync(`${MEDIA_DIR}/${SLUG}-video-frame.png`, Buffer.from(data.__videoFrame.split(',')[1], 'base64'));
}
writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log('wrote', OUT, 'docH', data.__doc.scrollHeight, 'preSettle', preH, 'treeNodes', data.__treeCount, 'root', JSON.stringify(data.__doc.rootRect));
console.log('pageChildren', JSON.stringify(data.__pageChildren));
console.log('fonts', JSON.stringify(data.__fonts.filter(f => f.status === 'loaded')));
console.log('media', JSON.stringify(data.__mediaUrls));
if (HARVEST) console.log('harvest', JSON.stringify(data.__harvest));
await browser.close();
