import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8795/home-proposed.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
console.log(JSON.stringify(await p.evaluate(() => {
  const d = (el) => { const rc = el.getBoundingClientRect(); const cs = getComputedStyle(el); return [el.className.split(' ')[0], Math.round(rc.x), Math.round(rc.y + scrollY), Math.round(rc.width), Math.round(rc.height), cs.height, cs.flex, cs.alignSelf]; };
  return Array.from(document.querySelectorAll('.stories__slide')).map(li => [d(li), d(li.querySelector('.card__body')), d(li.querySelector('.card__text')), d(li.querySelector('.card__text p')), d(li.querySelector('.link-arrow'))]);
}), null, 0)); await b.close();
