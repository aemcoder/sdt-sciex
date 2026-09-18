import { chromium } from 'playwright';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';
const browser = await chromium.launch();
const ctx = await newLiveContext(browser, { viewport: { width: 360, height: 800 } });
const page = await ctx.newPage();
await gotoLive(page, 'https://sciex.com/', { waitUntil: 'domcontentloaded', timeoutMs: 90000, settleMs: 2500 });
await dismissOverlays(page, {});
await page.mouse.move(2,2);
await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } window.scrollTo(0,0); });
await page.waitForTimeout(800);
const r = await page.evaluate(() => {
  const wrap = document.querySelector('#splide01-track > div:first-child > div > div:last-child');
  const dump = (el) => { const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); return { tag: el.tagName, cls: el.className, text: el.textContent.trim().slice(0,30), rect: [rc.x, rc.y + scrollY, rc.width, rc.height], display: cs.display, fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, color: cs.color, bg: cs.backgroundColor, w: cs.width, h: cs.height, p: cs.padding, m: cs.margin, gap: cs.gap, border: cs.border, radius: cs.borderRadius, opacity: cs.opacity, fill: cs.fill, stroke: cs.stroke, transform: cs.transform, alignItems: cs.alignItems, justify: cs.justifyContent, visibility: cs.visibility, cursor: cs.cursor, disabled: el.disabled }; };
  const all = [dump(wrap), ...Array.from(wrap.querySelectorAll('*')).map(dump)];
  return { html: wrap.outerHTML, all, walkme: !!document.querySelector('#walkme-player'), walkmeVisible: (() => { const w = document.querySelector('#walkme-player'); if (!w) return null; const cs = getComputedStyle(w); const rc = w.getBoundingClientRect(); return { display: cs.display, rect: [rc.x, rc.y, rc.width, rc.height] }; })(), splideCls: document.querySelector('#splide01').className, slideCls: Array.from(document.querySelectorAll('#splide01 .splide__slide')).map(s => s.className + ' | ' + s.getAttribute('style')), listStyle: document.querySelector('#splide01-list').getAttribute('style'), trackStyle: document.querySelector('#splide01-track').getAttribute('style') };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
