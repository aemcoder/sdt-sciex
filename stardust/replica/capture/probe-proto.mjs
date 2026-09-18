import { chromium } from 'playwright';
const W = Number(process.argv[2] || 1440); const sels = process.argv.slice(3);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: 900 } });
await p.goto('http://localhost:8795/home-proposed.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
const r = await p.evaluate((sels) => {
  const out = { doc: document.documentElement.scrollHeight, main: !!document.querySelector('.container-v2.aem-GridColumn'), sections: [] };
  document.querySelectorAll('main > section, header, .footer-spacer, .support-band, footer').forEach(el => { const rc = el.getBoundingClientRect(); out.sections.push([el.className.split(' ')[0] || el.tagName, Math.round(rc.y + scrollY), Math.round(rc.height)]); });
  out.q = {};
  for (const s of sels) { const el = document.querySelector(s); if (!el) { out.q[s] = null; continue; } const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); out.q[s] = { rect: [Math.round(rc.x*10)/10, Math.round((rc.y+scrollY)*10)/10, Math.round(rc.width*10)/10, Math.round(rc.height*10)/10], fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ff: cs.fontFamily.slice(0,40), disp: cs.display, pad: cs.padding, mar: cs.margin, w: cs.width, h: cs.height }; }
  out.fonts = Array.from(document.fonts).map(f => f.family + ' ' + f.weight + ' ' + f.status);
  return out;
}, sels);
console.log(JSON.stringify(r, null, 1)); await b.close();
