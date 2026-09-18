// Computed-style lift for group G1 (products/technology v3 pages) — copy of lift-pharma.mjs with the selector
// map read from a JSON file so one script serves every page. One live navigation per width.
// usage: node lift-g1.mjs <url> <width> <selectors.json> <out.json>
import { chromium } from 'playwright';
import fs from 'node:fs';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';
const [,, url, width, selFile, out] = process.argv;
const W = Number(width);
const PROPS = ['display','position','top','zIndex','width','height','minHeight','maxWidth','minWidth','marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','borderTopWidth','borderBottomWidth','borderLeftWidth','borderRightWidth','borderTopColor','borderBottomColor','borderLeftColor','borderRadius','gap','columnGap','rowGap','gridTemplateColumns','gridTemplateRows','flexDirection','flexWrap','alignItems','alignSelf','justifyContent','flex','flexGrow','flexShrink','flexBasis','aspectRatio','objectFit','opacity','transform','overflow','overflowX','textTransform','whiteSpace','textRendering','webkitFontSmoothing','fontVariationSettings','fontKerning','textWrap','borderTopStyle','textDecorationLine','textAlign','verticalAlign','fill','stroke','inset','right','bottom','left','textOverflow'];
const SEL = JSON.parse(fs.readFileSync(selFile, 'utf8'));
const browser = await chromium.launch();
const ctx = await newLiveContext(browser, { viewport: { width: W, height: 900 } });
const page = await ctx.newPage();
await gotoLive(page, url);
await dismissOverlays(page);
await page.waitForTimeout(1500);
await page.evaluate(() => document.fonts.ready);
const res = await page.evaluate(({ SEL, PROPS }) => {
  const out = { docH: document.documentElement.scrollHeight, vw: innerWidth, els: {} };
  for (const [k, sel] of Object.entries(SEL)) {
    let el = null; try { el = document.querySelector(sel); } catch (e) { out.els[k] = { error: String(e) }; continue; }
    if (!el) { out.els[k] = null; continue; }
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    const o = { sel, rect: [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width*10)/10, Math.round(r.height*10)/10] };
    for (const p of PROPS) { const v = cs[p]; if (v !== undefined && v !== '' ) o[p] = v; }
    o.text = (el.textContent || '').trim().slice(0, 40);
    if (el.tagName === 'IMG') o.currentSrc = el.currentSrc;
    out.els[k] = o;
  }
  out.fontsLoaded = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight);
  return out;
}, { SEL, PROPS });
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log('docH', res.docH, 'vw', res.vw, 'els', Object.keys(res.els).length, 'nulls', Object.entries(res.els).filter(([k,v])=>!v).map(([k])=>k).join(','));
await browser.close();
