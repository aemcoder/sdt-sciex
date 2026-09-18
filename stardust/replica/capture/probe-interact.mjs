// Targeted before/after interaction probe (Alpine-driven inline style + class changes).
// usage: node probe-interact.mjs <width> <clickSel>[,<clickSel>...] <watchSel>[,<watchSel>...]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';
const W = Number(process.argv[2]); const clicks = process.argv[3].split('||'); const watch = process.argv[4].split('||'); const out = process.argv[5];
const browser = await chromium.launch(); const ctx = await newLiveContext(browser, { viewport: { width: W, height: 900 } }); const page = await ctx.newPage();
await gotoLive(page, 'https://sciex.com/', { waitUntil: 'domcontentloaded', timeoutMs: 90000, settleMs: 2500 }); await dismissOverlays(page, {}); await page.mouse.move(2, 2); await page.waitForTimeout(800);
const snap = (sels) => page.evaluate((sels) => sels.map(s => Array.from(document.querySelectorAll(s)).slice(0, 12).map(el => { const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); return { s, cls: (el.getAttribute('class') || '').slice(0, 140), style: (el.getAttribute('style') || '').slice(0, 160), display: cs.display, vis: cs.visibility, op: cs.opacity, rect: [Math.round(rc.x), Math.round(rc.y + scrollY), Math.round(rc.width), Math.round(rc.height)], transform: cs.transform, maxH: cs.maxHeight, bb: cs.borderBottomColor, transition: cs.transitionProperty + ' ' + cs.transitionDuration, ariaExp: el.getAttribute('aria-expanded'), text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) }; })), sels);
const result = [];
for (const c of clicks) {
  const before = await snap(watch);
  let clicked = null;
  try { const loc = page.locator(c).first(); await loc.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await loc.click({ timeout: 4000, force: true }); clicked = true; } catch (e) { clicked = String(e).slice(0, 120); }
  await page.waitForTimeout(150); const mid = await snap(watch); await page.waitForTimeout(900); const after = await snap(watch);
  const diff = [];
  watch.forEach((s, i) => { (after[i] || []).forEach((a, k) => { const b = (before[i] || [])[k]; if (!b) { diff.push({ s, k, new: a }); return; } const ch = {}; for (const key of Object.keys(a)) if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) ch[key] = [b[key], a[key]]; if (Object.keys(ch).length) diff.push({ s, k, text: a.text, ch }); }); });
  result.push({ click: c, clicked, diff, midSample: mid.flat().filter((m, i) => JSON.stringify(m) !== JSON.stringify(before.flat()[i])).slice(0, 6) });
  await page.mouse.move(2, 2); await page.waitForTimeout(400);
}
writeFileSync(out, JSON.stringify(result, null, 1)); console.log(JSON.stringify(result, null, 0).slice(0, 6000)); await browser.close();
