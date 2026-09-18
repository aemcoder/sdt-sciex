import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8795/home-proposed.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
const r = await p.evaluate(() => {
  const w = (sel) => Array.from(document.querySelectorAll(sel)).map(e => [Math.round(e.getBoundingClientRect().width*100)/100, e.textContent.trim().slice(0,30), getComputedStyle(e).fontVariationSettings]);
  const probe = (family, weight, size, text) => { const c = document.createElement('canvas').getContext('2d'); c.font = `${weight} ${size}px ${family}`; return c.measureText(text).width; };
  const T1 = 'The leader in mass spectrometry and capillary electrophoresis solutions', T3 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789';
  const tw = {}; for (const wt of [270, 330, 450, 530]) { tw['geo-' + wt + '-T1'] = probe('Geogrotesque', wt, 100, T1); tw['geo-' + wt + '-T3'] = probe('Geogrotesque', wt, 100, T3); }
  const sp = document.createElement('span'); sp.style.cssText = 'position:absolute;white-space:nowrap;font:530 16px Geogrotesque;font-variation-settings:"wdth" 550'; sp.textContent = 'Mass Spectrometers'; document.body.appendChild(sp); const w1 = sp.getBoundingClientRect().width; sp.style.fontVariationSettings = 'normal'; const w2 = sp.getBoundingClientRect().width; sp.remove();
  return { cardTitles: w('.card__title'), icH3: w('.icon-card h3'), tabSpan: w('.tabs__bar button > span'), tw, massSpec: { wdth550: w1, normal: w2 }, bodyFVS: getComputedStyle(document.body).fontVariationSettings };
});
console.log(JSON.stringify(r, null, 1)); await b.close();
