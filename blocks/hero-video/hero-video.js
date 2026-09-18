/**
 * hero-video — live `.hero-large` on /stories: a 95svh-tall cinematic band whose background is an
 * autoplaying, muted, looping video (poster = frame 0) with the copy pinned bottom-left in the
 * container (title, kicker, white arrow link). Two stacked instances on live. Distinct from G1's
 * `hero-band` (picture band, JS frozen for this group) because the mp4 URL is CONTENT
 * (dynamics V-02, embed-passthrough) and the block must build the `<video>`.
 * Schema: stardust/eds-schema/stories.json § hero-large. Decode tier: template-slotted — the
 * prototype's inner DOM is rebuilt from generated wrappers and every authored node MOVES (EW1–EW3).
 *
 * Authoring (simple shape — ONE row, TWO cells; a single flat cell also decodes):
 *   <div>
 *     <div><p><img src="https://content.da.live/…/media/about-support/Aliri-…-frame.jpg" alt=""></p>
 *          <p><a href="https://sciex.com/content/dam/SCIEX/stories/aliri/Aliri-SCIEX-HeaderAutoPlay.mp4">https://sciex.com/…/Aliri-SCIEX-HeaderAutoPlay.mp4</a></p></div>
 *     <div><h2>A cast of thousands</h2>            title (h1 when it is the page's heading)
 *          <p>The Pursuit</p>                              kicker
 *          <p><em><a href="/stories/articles/a-cast-of-thousands">Find out more</a></em></p></div>
 *   </div>
 * The poster picture MOVES into a hidden wrapper (still the editable image; its src becomes the
 * player poster, width widened per #110); the mp4 link paragraph MOVES into an sr-only wrapper
 * (editable, the video's accessible description). The video source is the LIVE sciex.com URL —
 * never a content.da.live media URL (#103). `prefers-reduced-motion` → poster only, no autoplay.
 * No words are added by decorate().
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function wrapNode(node, className) {
  const w = el('div', className);
  w.append(node);
  return w;
}

// Every authored element as flat siblings (#104 — expand a media-led cell the runtime folded
// into one <p>; bare text → <p>, HARNESS-ONLY fallback, EW5).
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img') && kids[0].childNodes.length > 1) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        if (n.textContent.trim()) { const p = el('p'); p.append(n); return p; }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) { const p = el('p'); p.append(...cell.childNodes); out.push(p); }
  });
  return out;
}

const isMedia = (n) => n.matches('picture, img') || !!n.querySelector('picture, img');
const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const isVideoLink = (n) => {
  const a = n.querySelector('a[href]');
  return !!a && /\.(mp4|webm|ogv|m4v)(\?|$)/i.test(a.getAttribute('href') || '');
};
const isCta = (n) => !isMedia(n) && !!n.querySelector('a');

function posterSrc(pic) {
  const img = pic.matches('img') ? pic : pic.querySelector('img');
  if (!img) return '';
  let src = img.getAttribute('src') || '';
  const source = pic.querySelector('source[srcset]');
  if (source) [src] = source.srcset.split(/[\s,]+/);
  return src.replace(/([?&])width=\d+/, '$1width=2000');
}

export default function decorate(block) {
  const nodes = collectNodes(block);
  const media = nodes.find(isMedia) || null;
  const videoLink = nodes.find(isVideoLink) || null;
  const heading = nodes.find(isHeading) || null;
  const ctas = nodes.filter((n) => n !== media && n !== videoLink && !isHeading(n) && isCta(n));
  const texts = nodes.filter((n) => n !== media && n !== videoLink && n !== heading
    && !ctas.includes(n));

  const sec = el('section', 'hero-video-sec');
  const stage = el('div', 'hero-video-stage');

  if (videoLink) {
    const a = videoLink.querySelector('a[href]');
    const video = el('video', 'hero-video-media');
    video.muted = true;
    video.loop = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.preload = 'metadata';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reduce.matches) video.autoplay = true;
    if (media) video.poster = posterSrc(media);
    const source = el('source');
    source.src = a.href;
    source.type = /\.webm(\?|$)/i.test(a.href) ? 'video/webm' : 'video/mp4';
    video.append(source);
    stage.append(video);
  }
  if (media) {
    const poster = el('div', 'hero-video-poster');
    if (videoLink) poster.hidden = true;
    poster.append(media.matches('picture, img') && media.closest('p') ? media.closest('p') : media);
    stage.append(poster);
  }

  const container = el('div', 'hero-video-caption container');
  const row = el('div', 'hero-video-row');
  const col = el('div', 'hero-video-col');
  if (heading) col.append(wrapNode(heading, 'hero-video-title'));
  if (texts.length) { const k = el('div', 'hero-video-kicker'); k.append(...texts); col.append(k); }
  if (ctas.length) {
    const actions = el('div', 'hero-video-actions');
    ctas.forEach((c) => actions.append(wrapNode(c, 'hero-video-cta')));
    col.append(actions);
  }
  if (videoLink) {
    const src = el('div', 'hero-video-source sr-only');
    src.append(videoLink);
    col.append(src);
  }
  row.append(col);
  container.append(row);
  stage.append(container);
  sec.append(stage);
  block.replaceChildren(sec);
}
