// Build-side tree dump (same shape as lift-g4 __tree) for a local prototype URL — free, no live hit.
// usage: node probe-build-g4.mjs <url> <root-selector> <width> <out.json>
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const [URL, ROOT, Ws, OUT] = process.argv.slice(2); const W = Number(Ws || 1440);
const PROPS = ['display','position','width','height','marginTop','marginBottom','marginLeft','marginRight','paddingTop','paddingBottom','paddingLeft','paddingRight','fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','float','flexBasis','maxWidth','overflowX','borderTopWidth','borderRadius','textAlign','letterSpacing','webkitFontSmoothing'];
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: 900 } });
await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(600); await page.evaluate(() => document.fonts.ready);
const data = await page.evaluate(({ ROOT, PROPS }) => {
  const sy = window.scrollY; const tree = [];
  const walk = (el, depth, path) => { const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); const st = {}; for (const p of PROPS) st[p] = cs[p];
    const own = Array.from(el.childNodes).filter(c => c.nodeType === 3 && c.textContent.trim()).map(c => c.textContent.replace(/\s+/g, ' ').trim());
    const node = { path, depth, tag: el.tagName.toLowerCase(), id: el.id || undefined, cls: el.getAttribute('class') || undefined, rect: { x: +rc.x.toFixed(1), y: +(rc.y + sy).toFixed(1), w: +rc.width.toFixed(1), h: +rc.height.toFixed(1) }, style: st }; if (own.length) node.text = own.join(' / ').slice(0, 160);
    const b = getComputedStyle(el, '::before'); if (b.content && b.content !== 'none' && b.content !== 'normal') node.before = { content: b.content, font: b.font, w: b.width, h: b.height };
    tree.push(node); if (el.tagName.toLowerCase() === 'svg') return; let k = 0; for (const ch of el.children) { walk(ch, depth + 1, `${path}/${k}`); k += 1; } };
  const root = document.querySelector(ROOT); if (root) walk(root, 0, '0');
  return { __tree: tree, __doc: { scrollHeight: document.documentElement.scrollHeight, rootRect: root ? root.getBoundingClientRect().toJSON() : null }, __fonts: Array.from(document.fonts).map(f => ({ family: f.family, weight: f.weight, status: f.status })) };
}, { ROOT, PROPS });
writeFileSync(OUT, JSON.stringify(data)); console.log('docH', data.__doc.scrollHeight, 'nodes', data.__tree.length, 'fonts', JSON.stringify(data.__fonts.filter(f => f.status === 'loaded').map(f => f.family + ':' + f.weight)));
await browser.close();
