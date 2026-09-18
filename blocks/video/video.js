/**
 * video — HTML5 video player (Block Collection `video` content model): one cell holding a poster
 * image and a link to the media file. First use: the SCIEX Now dashboard video of /support (live
 * .StandardVideo > .video-banner > .video-wrapper; dynamics V-02, embed-passthrough — the live mp4
 * URL is the content). Prototype: stardust/prototypes/support-proposed.html `.sn-video`; schema:
 * stardust/eds-schema/support.json § video. Decode tier: template-slotted.
 *
 * Authoring (simple shape, one row, one cell):
 *   <p><img alt="…"></p>                                   poster (editorial, content.da.live URL)
 *   <p><a href="https://…/video.mp4">https://…/video.mp4</a></p>   the media source (link text =
 *   URL, the collection convention) Both authored nodes MOVE: the poster <picture> into a hidden
 *   .video-poster wrapper (still the editable image; its src becomes the player poster, width param
 *   widened per #110), the link paragraph into an sr-only .video-source wrapper (editable, and the
 *   player's accessible description). `preload="metadata"` instead of live `auto` (the full mp4
 *   would otherwise download for every visitor; poster, controls and duration render the same —
 *   stardust/eds-conversion-log-g4.md § 4). Never a content.da.live media URL for the mp4 (#103 —
 *   auth-gated for visitors).
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function posterSrc(pic) {
  const img = pic.matches('img') ? pic : pic.querySelector('img');
  if (!img) return '';
  let src = img.getAttribute('src') || '';
  const source = pic.querySelector('source[srcset]');
  if (source) [src] = source.srcset.split(/[\s,]+/);
  return src.replace(/([?&])width=\d+/, '$1width=2000');
}

export default function decorate(block) {
  const pic = block.querySelector('picture, img');
  const link = [...block.querySelectorAll('a[href]')].find((a) => /\.(mp4|webm|ogv|m4v)(\?|$)/i.test(a.href)) || block.querySelector('a[href]');

  const wrap = el('div', 'video-wrap');
  if (link) {
    const video = document.createElement('video');
    video.controls = true;
    video.setAttribute('controlslist', 'nodownload');
    video.preload = 'metadata';
    video.setAttribute('playsinline', '');
    if (pic) video.poster = posterSrc(pic);
    const source = document.createElement('source');
    source.src = link.href;
    source.type = /\.webm(\?|$)/i.test(link.href) ? 'video/webm' : 'video/mp4';
    video.append(source);
    wrap.append(video);
  }
  if (pic) {
    const poster = el('div', 'video-poster');
    poster.hidden = true;
    poster.append(pic.closest('p') || pic);
    wrap.append(poster);
  }
  if (link) {
    const src = el('div', 'video-source sr-only');
    src.append(link.closest('p') || link);
    wrap.append(src);
  }
  block.replaceChildren(wrap);
}
