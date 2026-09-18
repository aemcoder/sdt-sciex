// One live hit: click testimonial next/prev/pagination and record the resulting DOM state (pagination text,
// disabled arrows, slide classes/styles, transitions) — motion-observe records classes but not text.
import { chromium } from 'playwright'; import fs from 'node:fs';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';
const [,, url, width, out] = process.argv; const W = Number(width);
const browser = await chromium.launch(); const ctx = await newLiveContext(browser, { viewport: { width: W, height: 900 } });
const page = await ctx.newPage(); await gotoLive(page, url); await dismissOverlays(page); await page.waitForTimeout(1500);
const state = (label) => page.evaluate((label) => {
  const q = s => document.querySelector(s); const qa = s => [...document.querySelectorAll(s)];
  const pag = qa('#C ul.splide__pagination button').map(b => ({ html: b.innerHTML, cls: b.className.replace(/splide__pagination|text-base|tw-text-blue-700/g, '').trim(), sel: b.getAttribute('aria-selected'), w: Math.round(b.getBoundingClientRect().width) }));
  const slides = qa('#C .splide__slide').map(li => ({ cls: li.className.replace(/tw-\S+|splide__slide|w-h-full/g, '').trim(), style: li.getAttribute('style'), op: getComputedStyle(li).opacity, tr: getComputedStyle(li).transition, ah: li.getAttribute('aria-hidden') }));
  const prev = q('#C .splide__arrow--prev'), next = q('#C .splide__arrow--next');
  const d = q('#D'); const dpag = qa('#D ul.splide__pagination button').map(b => b.innerHTML);
  return { label, pag, slides, prevDisabled: prev.disabled, nextDisabled: next.disabled, nextBg: getComputedStyle(next).backgroundColor, nextBgSize: getComputedStyle(next).backgroundSize, nextTr: getComputedStyle(next).transition, dCls: d.className.replace(/tw-\S+/g,'').trim(), dpag, dList: q('#D-list') && (q('#D-list').getAttribute('style') + ' | ' + getComputedStyle(q('#D-list')).transition), dSlides: qa('#D .splide__slide').map(li => li.className.replace(/tw-\S+|splide__slide/g,'').trim()), dPrev: q('#D .splide__arrow--prev') ? q('#D .splide__arrow--prev').disabled : null, dNext: q('#D .splide__arrow--next') ? q('#D .splide__arrow--next').disabled : null };
}, label);
const res = { url, width: W, states: [] };
await page.evaluate(() => document.querySelector('#C').scrollIntoView()); await page.waitForTimeout(600);
res.states.push(await state('initial'));
await page.click('#C .splide__arrow--next'); await page.waitForTimeout(150); res.states.push(await state('next@150ms'));
await page.waitForTimeout(700); res.states.push(await state('next settled'));
await page.click('#C .splide__arrow--next'); await page.waitForTimeout(800); res.states.push(await state('next2 settled'));
await page.click('#C .splide__arrow--prev'); await page.waitForTimeout(800); res.states.push(await state('prev settled'));
await page.click('#C ul.splide__pagination li:nth-child(3) button', { force: true }).catch(e => res.pagClickError = String(e)); await page.waitForTimeout(800); res.states.push(await state('pag3 settled'));
if (W < 768) { await page.evaluate(() => document.querySelector('#D').scrollIntoView()); await page.waitForTimeout(400); res.states.push(await state('D initial'));
  await page.click('#D .splide__arrow--next'); await page.waitForTimeout(100); res.states.push(await state('D next@100ms')); await page.waitForTimeout(900); res.states.push(await state('D next settled')); }
// sub-nav anchor click → where does the page land?
await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
await page.click(".js-scroll-to[href='#B']"); const ys = []; for (let i = 0; i < 10; i++) { await page.waitForTimeout(120); ys.push(await page.evaluate(() => scrollY)); }
res.anchorClickScroll = { ys, secBTop: await page.evaluate(() => document.querySelector('#B').getBoundingClientRect().top + scrollY), navH: await page.evaluate(() => document.querySelector('.page-sub-nav').getBoundingClientRect().height), htmlScrollBehavior: await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), active: await page.evaluate(() => [...document.querySelectorAll('.js-scroll-to')].map(a => a.classList.contains('active'))) };
fs.writeFileSync(out, JSON.stringify(res, null, 1));
for (const s of res.states) console.log(s.label, '| pag', JSON.stringify(s.pag.map(p => p.html + (p.cls ? '[' + p.cls + ']' : ''))), '| prev/next disabled', s.prevDisabled, s.nextDisabled, '| slides', JSON.stringify(s.slides.map(x => x.cls + ' op' + x.op + ' ' + (x.style || '').slice(0, 60))), '| nextBg', s.nextBg, s.nextBgSize, '| D', s.dCls, JSON.stringify(s.dpag), s.dList, JSON.stringify(s.dSlides), s.dPrev, s.dNext);
console.log('slide transition:', res.states[1].slides[0].tr, '| next btn transition:', res.states[0].nextTr);
console.log('anchor click', JSON.stringify(res.anchorClickScroll));
await browser.close();
