/**
 * support-hero — the SCIEX Now landing "carousel" of /support (live .overlayboxcarousel >
 * #myCarousel, a single slide): image, translucent grey bar with the teal title and the orange
 * login CTA, one square indicator hanging 50px below the slide. Prototype:
 * stardust/prototypes/support-proposed.html `.sn-hero`; schema: stardust/eds-schema/support.json §
 * support-hero. Decode tier: template-slotted (#95) — fixed composition, the authored nodes MOVE.
 *
 * Authoring rows (simple shape):
 *   1. <img> slide image (editorial — content.da.live URL)
 *   2. <p>The destination for all your support needs</p>   the bar title (a <p>: live is h4 > span,
 *      the page's h1 is the intro heading — stardust/eds-conversion-log-g4.md § 4)
 *   3. <p><strong><a href="https://sciex.com/bin/sciex/login">Log in to SCIEX Now</a></strong></p>
 *      the CTA paragraph MOVES into .sn-hero-cta (EW3); the block paints the live .btn.orange on
 *      the
 *      anchor
 *
 * The indicator <ol> is presentational (one slide, no words); the carousel controls never rendered
 * on live.
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

export default function decorate(block) {
  const media = block.querySelector('picture, img');
  const ps = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
  const cta = ps.find((p) => p.querySelector('a[href]')) || null;
  const title = ps.find((p) => p !== cta && p.textContent.trim()) || null;

  const inner = el('div', 'sn-hero-inner');
  const indicators = el('ol', 'sn-hero-indicators');
  indicators.setAttribute('aria-hidden', 'true');
  indicators.append(el('li', 'active'));
  const slide = el('div', 'sn-hero-slide');
  if (media) {
    const img = el('div', 'sn-hero-img');
    img.append(media.closest('p') || media);
    slide.append(img);
  }
  const bar = el('div', 'sn-hero-bar');
  const titleRow = el('div', 'sn-hero-title');
  if (title) {
    const text = el('div', 'sn-hero-text');
    text.append(title);
    titleRow.append(text);
  }
  if (cta) {
    const actions = el('div', 'sn-hero-cta');
    actions.append(cta);
    titleRow.append(actions);
  }
  bar.append(titleRow);
  slide.append(bar);
  inner.append(indicators, slide);
  block.replaceChildren(inner);
}
