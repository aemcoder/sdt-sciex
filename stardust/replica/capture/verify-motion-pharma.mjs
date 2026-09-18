// Behaviour-match check on the PROTOTYPE (motion analog of the anchor probe): states must match the live observation.
import { chromium } from 'playwright';
const URL = 'http://localhost:8792/applications-pharma-and-biopharma-proposed.html';
const browser = await chromium.launch(); const out = {};
for (const W of [1440, 360]) {
  const page = await browser.newPage({ viewport: { width: W, height: 900 } }); const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  const r = { errors };
  r.initial = await page.evaluate(() => ({ sticky: document.querySelector('.subnav-wrap').classList.contains('sticky-subnav'), active: [...document.querySelectorAll('.subnav__link')].map(a => a.classList.contains('active')), pag: [...document.querieSelectorAllSafe ? [] : document.querySelectorAll('#C .carousel__pagination button')].map(b => b.innerHTML), prevDisabled: document.querySelector('#C .carousel__arrow--prev').disabled, dCtl: !!document.querySelector('#D [data-arrows]'), dOverflow: document.getElementById('D').classList.contains('is-overflow') }));
  await page.evaluate(() => scrollTo(0, 1800)); await page.waitForTimeout(400);
  r.scrolled1800 = await page.evaluate(() => ({ sticky: document.querySelector('.subnav-wrap').classList.contains('sticky-subnav'), noScrollbar: document.querySelector('.js-scroll-container').classList.contains('no-scrollbar'), subnavTop: Math.round(document.querySelector('.subnav-wrap').getBoundingClientRect().top), active: [...document.querySelectorAll('.subnav__link')].map(a => a.textContent.trim() + ':' + a.classList.contains('active')) }));
  await page.evaluate(() => document.querySelector('#C').scrollIntoView({ behavior: 'instant' })); await page.waitForTimeout(300);
  await page.click('#C .carousel__arrow--next'); await page.waitForTimeout(120);
  r.tMid = await page.evaluate(() => ({ op: [...document.querySelectorAll('#C .testimonial__slide')].map(li => Number(getComputedStyle(li).opacity).toFixed(2)), tr: getComputedStyle(document.querySelector('#C .testimonial__slide')).transition }));
  await page.waitForTimeout(600);
  r.tNext = await page.evaluate(() => ({ pag: [...document.querySelectorAll('#C .carousel__pagination button')].map(b => b.innerHTML + (b.classList.contains('is-active') ? '[is-active]' : '')), slides: [...document.querySelectorAll('#C .testimonial__slide')].map(li => li.className.replace('testimonial__slide', '').replace('is-fading', '').trim() + ' op' + getComputedStyle(li).opacity), prevDisabled: document.querySelector('#C .carousel__arrow--prev').disabled, nextDisabled: document.querySelector('#C .carousel__arrow--next').disabled }));
  await page.click('#C .carousel__arrow--next'); await page.waitForTimeout(700);
  r.tLast = await page.evaluate(() => ({ pag: [...document.querySelectorAll('#C .carousel__pagination button')].map(b => b.innerHTML + (b.classList.contains('is-active') ? '[is-active]' : '')), nextDisabled: document.querySelector('#C .carousel__arrow--next').disabled }));
  if (W < 768) {
    await page.evaluate(() => document.querySelector('#D').scrollIntoView({ behavior: 'instant' })); await page.waitForTimeout(300);
    r.dInitial = await page.evaluate(() => ({ pag: [...document.querySelectorAll('#D .carousel__pagination button')].map(b => b.innerHTML), prevDisabled: document.querySelector('#D .carousel__arrow--prev').disabled, tr: getComputedStyle(document.getElementById('D-list')).transition }));
    await page.click('#D .carousel__arrow--next'); await page.waitForTimeout(100);
    r.dMid = await page.evaluate(() => getComputedStyle(document.getElementById('D-list')).transform);
    await page.waitForTimeout(800);
    r.dNext = await page.evaluate(() => ({ transform: document.getElementById('D-list').style.transform, slides: [...document.querySelectorAll('#D .stories__slide')].map(li => li.className.replace(/stories__slide|card/g, '').trim()), pag: [...document.querySelectorAll('#D .carousel__pagination button')].map(b => b.innerHTML + (b.classList.contains('is-active') ? '[is-active]' : '')) }));
  }
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
  await page.click(".subnav__link[href='#B']"); const ys = []; for (let i = 0; i < 10; i++) { await page.waitForTimeout(120); ys.push(await page.evaluate(() => scrollY)); }
  r.anchorClick = { ys, secBTop: await page.evaluate(() => Math.round(document.querySelector('#B').getBoundingClientRect().top + scrollY)), active: await page.evaluate(() => [...document.querySelectorAll('.subnav__link')].map(a => a.classList.contains('active'))) };
  if (W >= 1024) {
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
    await page.hover('.app-cards__grid .card:nth-child(1) img'); await page.waitForTimeout(600);
    r.hoverImg = await page.evaluate(() => getComputedStyle(document.querySelector('.app-cards__grid .card:nth-child(1) img')).transform);
    await page.hover('.app-cards__grid .card:nth-child(1) .link-arrow'); await page.waitForTimeout(600);
    r.hoverLink = await page.evaluate(() => { const a = document.querySelector('.app-cards__grid .card:nth-child(1) .link-arrow'); return { color: getComputedStyle(a).color, underlineLeft: getComputedStyle(a.querySelector('.link-arrow__underline')).left, svgMl: getComputedStyle(a.querySelector('svg')).marginLeft }; });
    await page.hover('nav.breadcrumb li:nth-child(2) a'); await page.waitForTimeout(400);
    r.hoverCrumb = await page.evaluate(() => getComputedStyle(document.querySelector('nav.breadcrumb li:nth-child(2) a')).color);
  }
  out[W] = r; await page.close();
}
console.log(JSON.stringify(out, null, 1)); await browser.close();
