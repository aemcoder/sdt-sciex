// Generic computed-style lift for the G2 "applications" group (replica Phase 3 step 2).
// Unlike lift-pharma.mjs (hand-listed selectors) this walks EVERY element under the
// content root and records rect + computed styles keyed by a child-index path, so one
// live navigation per width serves all components of a page. Query with q-g2.py.
//   node lift-g2.mjs <url> <width> <out.json> [--root <sel>]
import { chromium } from 'playwright';
import fs from 'node:fs';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';
const args = process.argv.slice(2);
const [url, width, out] = args;
const W = Number(width);
const ROOT = args.includes('--root') ? args[args.indexOf('--root') + 1] : '.container-v2.aem-GridColumn';
const PROPS = ['display','position','top','left','right','bottom','zIndex','width','height','maxWidth','minWidth','minHeight','marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','borderTopWidth','borderBottomWidth','borderLeftWidth','borderRightWidth','borderTopColor','borderRadius','gap','columnGap','rowGap','gridTemplateColumns','flexDirection','flexWrap','alignItems','alignSelf','justifyContent','flex','flexGrow','flexShrink','flexBasis','aspectRatio','objectFit','objectPosition','opacity','transform','overflow','overflowX','overflowY','textTransform','whiteSpace','textAlign','textDecorationLine','verticalAlign','boxShadow','fill','stroke','strokeWidth','listStyleType','inset','visibility','pointerEvents','cursor','outline','transition','boxSizing','textWrap'];
const browser = await chromium.launch();
const ctx = await newLiveContext(browser, { viewport: { width: W, height: 900 } });
const page = await ctx.newPage();
await gotoLive(page, url);
await dismissOverlays(page);
// slow settle so lazy renditions + Splide/Plyr initialise
await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
await page.waitForTimeout(1500);
await page.evaluate(() => document.fonts.ready);
const res = await page.evaluate(({ ROOT, PROPS }) => {
  const root = document.querySelector(ROOT);
  const out = { docH: document.documentElement.scrollHeight, vw: innerWidth, root: ROOT, els: [] };
  if (!root) return out;
  const grid = root.querySelector(':scope > .cmp-container > .aem-Grid') || root;
  const comps = Array.from(grid.children);
  function rec(el, path, depth) {
    if (el.tagName === 'SVG' || el.tagName === 'svg') { const r = el.getBoundingClientRect(); out.els.push({ p: path, t: 'svg', c: el.getAttribute('class') || '', rect: [Math.round(r.x), Math.round(r.y + scrollY), +r.width.toFixed(1), +r.height.toFixed(1)], svg: el.outerHTML.slice(0, 1200) }); return; }
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'META' || el.tagName === 'SOURCE') return;
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    const o = { p: path, t: el.tagName.toLowerCase(), c: (el.getAttribute('class') || '').slice(0, 220), rect: [Math.round(r.x), Math.round(r.y + scrollY), +r.width.toFixed(1), +r.height.toFixed(1)] };
    if (el.id) o.id = el.id;
    for (const k of PROPS) { const v = cs[k]; if (v !== undefined && v !== '') o[k] = v; }
    const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(' ');
    if (own) o.text = own.slice(0, 80);
    if (el.tagName === 'IMG') { o.src = el.currentSrc || el.src; o.nat = [el.naturalWidth, el.naturalHeight]; o.alt = el.alt; }
    if (el.tagName === 'A') o.href = el.getAttribute('href');
    if (el.tagName === 'VIDEO') { o.poster = el.poster; o.vw = el.videoWidth; }
    out.els.push(o);
    if (cs.display === 'none' && depth > 2) return; // record hidden nodes once, don't descend
    Array.from(el.children).forEach((ch, i) => rec(ch, path + '/' + i, depth + 1));
  }
  comps.forEach((c, i) => rec(c, String(i), 0));
  out.fontsLoaded = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight);
  out.fontsError = [...document.fonts].filter(f => f.status === 'error').map(f => f.family + ' ' + f.weight);
  return out;
}, { ROOT, PROPS });
fs.writeFileSync(out, JSON.stringify(res));
console.log('docH', res.docH, 'vw', res.vw, 'els', res.els.length, 'fontErr', res.fontsError);
await browser.close();
