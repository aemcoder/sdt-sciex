import { chromium } from 'playwright';
import fs from 'node:fs';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';
const [,, url, width, out] = process.argv; const W = Number(width);
const browser = await chromium.launch();
const ctx = await newLiveContext(browser, { viewport: { width: W, height: 900 } });
const page = await ctx.newPage(); await gotoLive(page, url); await dismissOverlays(page); await page.waitForTimeout(1500);
const snap = (label) => page.evaluate((label) => {
  const q = s => document.querySelector(s); const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const sn = q('.page-sub-nav'), hb = q('.headerbar #page'), hdr = q('.headerbar'), inner = q('#subnav-primary');
  return { label, scrollY, subnav: { rect: r(sn), pos: getComputedStyle(sn).position, top: getComputedStyle(sn).top, z: getComputedStyle(sn).zIndex, cls: sn.className, innerRect: r(inner), innerCls: inner.className, innerStyle: inner.getAttribute('style') },
    header: { rect: r(hdr), pos: getComputedStyle(hdr).position, cls: hdr.className, pageCls: hb ? hb.className : null, pageRect: r(hb), pagePos: hb ? getComputedStyle(hb).position : null, bodyCls: document.body.className, htmlCls: document.documentElement.className },
    anchors: [...document.querySelectorAll('.js-scroll-to')].map(a => ({ t: a.textContent.trim(), cls: a.className.replace(/tw-\S+/g,'').trim(), spanW: a.querySelector('span').getBoundingClientRect().width, color: getComputedStyle(a).color })),
    fixedEls: [...document.querySelectorAll('body *')].filter(e => { const p = getComputedStyle(e).position; return (p === 'fixed' || p === 'sticky') && e.getBoundingClientRect().height > 0; }).map(e => ({ tag: e.tagName, id: e.id, cls: e.className.toString().slice(0, 80), pos: getComputedStyle(e).position, rect: r(e) })).slice(0, 20) };
}, label);
const res = { url, width: W, states: [] };
res.states.push(await snap('top'));
for (const y of [600, 1500, 3000]) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(700); res.states.push(await snap('y' + y)); }
await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(700); res.states.push(await snap('backtop'));
res.dControls = await page.evaluate(() => { const el = document.querySelector('#D-track > div:nth-child(1) > div:nth-child(2)'); return el ? el.outerHTML.replace(/\s+/g, ' ').slice(0, 4000) : null; });
res.dSection = await page.evaluate(() => { const el = document.querySelector('#D'); return { cls: el.className, listStyle: document.querySelector('#D-list').getAttribute('style'), slideStyle: document.querySelector('#D-slide01').getAttribute('style'), trackStyle: document.querySelector('#D-track').getAttribute('style') }; });
res.cControls = await page.evaluate(() => document.querySelector('#C [data-arrows]').outerHTML.replace(/\s+/g, ' ').slice(0, 5000));
res.sheets = await page.evaluate(() => [...document.styleSheets].map(s => s.href).filter(Boolean));
res.stickyRule = await page.evaluate(() => { let found = []; for (const s of document.styleSheets) { try { for (const r of s.cssRules) { if (r.selectorText && /sticky-subnav\b/.test(r.selectorText)) found.push((s.href||'inline').split('/').pop() + ' :: ' + r.cssText.slice(0, 200)); } } catch (e) {} } return found; });
fs.writeFileSync(out, JSON.stringify(res, null, 1));
for (const s of res.states) console.log(s.label, 'scrollY', s.scrollY, 'subnav', s.subnav.pos, s.subnav.rect, 'header', s.header.pos, s.header.rect, 'pagePos', s.header.pagePos, 'bodyCls', s.header.bodyCls.slice(0,60), '| fixed:', s.fixedEls.map(f => f.tag + '#' + f.id + '.' + f.cls.slice(0, 30) + ':' + f.pos + JSON.stringify(f.rect)).join(' ; '));
console.log('anchors', JSON.stringify(res.states[2].anchors));
console.log('subnav cls', res.states[2].subnav.cls, '| inner', res.states[2].subnav.innerCls, res.states[2].subnav.innerStyle);
console.log('D controls', res.dControls); console.log('D section', JSON.stringify(res.dSection));
console.log('sticky rules', res.stickyRule);
await browser.close();
