import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8792/applications-pharma-and-biopharma-proposed.html', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const q = s => [...document.querySelectorAll(s)].map(e => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return [Math.round(b.y + scrollY), Math.round(b.height), cs.height, cs.alignSelf, cs.flex]; });
  return { list: q('#D-list'), slides: q('#D-slide01,#D-slide02,#D-slide03'), bodies: q('#D .card__body'), texts: q('#D .card__text'), links: q('#D .link-arrow'), cList: q('#C-list'), cSlides: q('.testimonial__slide'), cMeta: q('.testimonial__meta') };
});
console.log(JSON.stringify(r, null, 0)); await b.close();
