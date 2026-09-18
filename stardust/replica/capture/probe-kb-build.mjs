// Build-side geometry probe for the kb-article prototype (free: no live hit). usage: node probe-kb-build.mjs <url> <width>
import { chromium } from 'playwright';
const [url, w] = [process.argv[2], Number(process.argv[3] || 360)];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const out = await p.evaluate(() => {
  const sy = window.scrollY; const R = el => { const r = el.getBoundingClientRect(); return { y: Math.round(r.y + sy), h: Math.round(r.height * 100) / 100, x: Math.round(r.x), w: Math.round(r.width * 100) / 100 }; };
  const one = sel => { const el = document.querySelector(sel); if (!el) return null; const cs = getComputedStyle(el); return { ...R(el), fs: cs.fontSize, lh: cs.lineHeight, fw: cs.fontWeight, ff: cs.fontFamily.slice(0, 30), pt: cs.paddingTop, pb: cs.paddingBottom, mt: cs.marginTop, mb: cs.marginBottom, disp: cs.display }; };
  const o = { docH: document.documentElement.scrollHeight, header: one('.site-header'), hdrTop: one('.hdr-top'), hdrNav: one('.hdr-nav') };
  o.noBleed = Array.from(document.querySelectorAll('.no-bleed > *')).map(el => ({ cls: el.className.split(' ')[0], ...R(el) }));
  o.article = Array.from(document.querySelectorAll('.kb-article > *')).map(el => ({ cls: el.className.split(' ')[0] || el.tagName.toLowerCase(), ...R(el) }));
  for (const [k, s] of Object.entries({ h1: '.kb-article__title', details: '.kb-details', detailsTd: '.kb-details td', detailsA: '.kb-details a', col8: '.kb-meta__details', col4: '.kb-meta__rating', avg: '.kb-stars--avg', avgI: '.kb-stars--avg i', tools: '.kb-tools', utilities: '.kb-tools__utilities', ruoP: '.kb-body__note', bodyP: '.kb-body p:not(.kb-body__note)', commentP: '.kb-comment p', btn: '.btn-legacy', spacer: '.footer-spacer', footer: 'footer', footerContainer: 'footer > .container', ftrTop: '.ftr-top', ftrSocial: '.ftr-social', ftrLinks: '.ftr-links', ftrColMob: '.ftr-col--mobile', ftrLangMob: '.ftr-lang--mobile', ftrLegal: '.ftr-legal', ftrLegalRow: '.ftr-legal__row', ftrLegalNav: '.ftr-legal__nav', ftrBottom: '.ftr-bottom', disclaimer: '#disclaimer', danaher: '.ftr-danaher', danaherImg: '.ftr-danaher img', partners: '.ftr-partners', partnersUl: '.ftr-partners ul', partnersLi: '.ftr-partners li', partnersA: '.ftr-partners a' })) o[k] = one(s);
  return o;
});
console.log(JSON.stringify(out)); await b.close();
