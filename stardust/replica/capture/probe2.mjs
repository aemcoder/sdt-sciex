import { chromium } from 'playwright';
const b = await chromium.launch();
for (const W of [1440, 360]) {
  const p = await b.newPage({ viewport: { width: W, height: 900 } });
  await p.goto('http://localhost:8795/home-proposed.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const d = (el) => { if (!el) return null; const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); return { rect: [Math.round(rc.x), Math.round(rc.y + scrollY), Math.round(rc.width*10)/10, Math.round(rc.height*10)/10], display: cs.display, lc: cs.webkitLineClamp, orient: cs.webkitBoxOrient, ov: cs.overflow, m: cs.margin, fs: cs.fontSize, fw: cs.fontWeight, w: cs.width }; };
    const span = document.querySelector('.tabs__bar button > span');
    const cards = Array.from(document.querySelectorAll('.three-card .card')).map(d);
    const cardTexts = Array.from(document.querySelectorAll('.three-card .card__text')).map(d);
    const ps = Array.from(document.querySelectorAll('.three-card .card__text p')).map(d);
    const links = Array.from(document.querySelectorAll('.three-card .card .link-arrow')).map(d);
    return { span: d(span), spanText: span && span.textContent, btn: d(span && span.parentElement), cards, cardTexts, ps, links, grid: d(document.querySelector('.three-card__grid')) };
  });
  console.log(W, JSON.stringify(r, null, 0));
  await p.close();
}
await b.close();
