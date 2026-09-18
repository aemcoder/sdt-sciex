// Canvas readback of the /support video's displayed first frame (full PNG) — the captured state the gate sees.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { newLiveContext, gotoLive, dismissOverlays } from '../../scripts/diff/live-session.mjs';
const browser = await chromium.launch(); const ctx = await newLiveContext(browser, { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage(); await gotoLive(page, 'https://sciex.com/support', { waitUntil: 'domcontentloaded', timeoutMs: 90000, settleMs: 2500 });
await dismissOverlays(page, {});
await page.evaluate(() => document.querySelector('video#vidLength').scrollIntoView());
await page.waitForFunction(() => document.querySelector('video#vidLength').readyState >= 2, null, { timeout: 30000 }).catch(() => {});
const info = await page.evaluate(async () => { const v = document.querySelector('video#vidLength'); if (v.readyState < 2) await new Promise(r => v.addEventListener('loadeddata', r, { once: true })); await new Promise(r => { v.addEventListener('seeked', r, { once: true }); v.currentTime = 0.04; setTimeout(r, 8000); }); await new Promise(r => requestAnimationFrame(() => setTimeout(r, 200))); const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); return { w: v.videoWidth, h: v.videoHeight, rs: v.readyState, dur: v.duration, t: v.currentTime, data: c.toDataURL('image/png') }; });
writeFileSync('stardust/prototypes/assets/media/g4/support-video-frame.png', Buffer.from(info.data.split(',')[1], 'base64'));
console.log('frame', info.w, info.h, 'readyState', info.rs, 'duration', info.dur, 'bytes', info.data.length);
await browser.close();
