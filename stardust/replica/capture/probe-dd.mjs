import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8795/home-proposed.html', { waitUntil: 'networkidle' });
console.log(JSON.stringify(await p.evaluate(() => Array.from(document.querySelectorAll('.hdr-search .hdr-dropdown__content a')).slice(0,2).map(a => { const cs = getComputedStyle(a); const r = a.getBoundingClientRect(); return { fs: cs.fontSize, lh: cs.lineHeight, pad: cs.padding, h: r.height, w: r.width, ff: cs.fontFamily.slice(0,20), fw: cs.fontWeight, ls: cs.letterSpacing, disp: cs.display, fvs: cs.fontVariationSettings }; }))));
await b.close();
