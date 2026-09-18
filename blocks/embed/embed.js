/**
 * embed — third-party frame from a URL (Block Collection `embed` content model): one cell holding
 * the link, iframe mounted when the block scrolls into view. First use: the Marketo/Eloqua
 * grant-support form of /education/grant-support (live #grantsform > .form-container-landing >
 * iframe https://info.sciex.com/LP=2259, 50% wide, 900px tall — variant `legacy`).
 * scripts/scripts.js has no embed auto-block (and is out of this conversion's scope), so the block
 * is authored explicitly. Prototype: stardust/prototypes/education-grant-support-proposed.html
 * `.lg-grant__form`; schema: stardust/eds-schema/education-grant-support.json § grant-form. Decode
 * tier: template-slotted.
 *
 * Authoring (simple shape, one row, one cell):
 *   <p><a href="https://info.sciex.com/LP=2259">https://info.sciex.com/LP=2259</a></p> The authored
 *   paragraph MOVES into an sr-only .embed-source wrapper (editable; also the frame's accessible
 *   description). The iframe carries no authored text.
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function mount(block, href) {
  if (block.dataset.embedLoaded) return;
  block.dataset.embedLoaded = 'true';
  const frame = document.createElement('iframe');
  frame.src = href;
  frame.loading = 'lazy';
  frame.setAttribute('allowfullscreen', '');
  frame.setAttribute('title', 'Embedded content');
  block.querySelector('.embed-frame').append(frame);
}

export default function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;
  const { href } = link;
  const frameWrap = el('div', 'embed-frame');
  const source = el('div', 'embed-source sr-only');
  source.append(link.closest('p') || link);
  block.replaceChildren(frameWrap, source);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        mount(block, href);
      }
    }, { rootMargin: '400px 0px' });
    io.observe(block);
  } else {
    mount(block, href);
  }
}
