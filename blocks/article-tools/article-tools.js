/**
 * article-tools — the KB article utilities band (live `.shade-box > .utilities`): Print,
 * "Rate Article:" + five rating stars, and the dead AddThis share slot. Prototype:
 * stardust/prototypes/kb-article-proposed.html `.kb-tools`; schema:
 * stardust/eds-schema/kb-article.json § article-tools. Decode tier: template-slotted (#95) —
 * fixed composition; the two authored paragraphs MOVE into the template's slots.
 *
 * Authoring rows (one item per row, paragraph-wrapped; links are plain <a>, not buttons):
 *   1. <p><a href="#print">Print</a></p>
 *        the block intercepts the fragment link → window.print() (dynamics M-11; D15 forbids a
 *        javascript: URL in content)
 *   2. <p>Rate Article:</p>                       the label, plain text as on live
 *   3. <p><a href="https://sciex.com/bin/sciex/login">Rate this article</a></p>
 *        the rating target (dynamics X-03: rating is sign-in only — anonymous state frozen; live
 *        carries the href on a text-less span.login-link). The block renders five star glyphs
 *        (aria-hidden) that fill 1..n on hover (live class mutation fa-star-o ↔ fa-star) and
 *        navigate to this href on click; the authored link itself is MOVED next to them as the
 *        stars' accessible name (visually hidden — the one authored string the live page never
 *        shows, recorded in stardust/eds-conversion-log-kb.md § 5).
 *
 * Interaction parity (stardust/replica/motion/kb-article.json): Print → print dialog; star hover
 * fill; link colour hovers (CSS). Nothing animates. The hidden pin button and the comment/rating
 * submission (login-only) are not modeled.
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function buildRateStars(href) {
  const stars = el('span', 'stars');
  const items = [];
  for (let i = 0; i < 5; i += 1) {
    const star = el('i', 'fa');
    star.setAttribute('aria-hidden', 'true');
    items.push(star);
    stars.append(star);
  }
  items.forEach((star, n) => {
    star.addEventListener('mouseenter', () => {
      items.forEach((s, i) => s.classList.toggle('full', i <= n));
    });
    star.addEventListener('click', () => {
      if (href) window.location.assign(href);
    });
  });
  stars.addEventListener('mouseleave', () => {
    items.forEach((s) => s.classList.remove('full'));
  });
  return stars;
}

export default function decorate(block) {
  const paragraphs = [...block.querySelectorAll('p')];
  if (!paragraphs.length) return;
  const links = [...block.querySelectorAll('a[href]')];
  const printLink = links.find((a) => /#print$/i.test(a.getAttribute('href')) || /^print$/i.test(a.textContent.trim()));
  const rateLink = links.find((a) => a !== printLink);
  const rateLabel = paragraphs.find((p) => !p.querySelector('a') && p.textContent.trim());

  const utilities = el('div', 'utilities');
  // live: the AddThis toolbox slot renders nothing (script dead on the source, T-11)
  const share = el('div', 'share');
  share.append(el('div', 'addthis'));
  utilities.append(share);

  if (printLink) {
    const print = el('span', 'print');
    const glyph = el('i', 'fa fa-print');
    glyph.setAttribute('aria-hidden', 'true');
    // MOVE the authored paragraph (the editor index sits on the <p>, EW3)
    print.append(glyph, document.createTextNode(' \u00a0\u00a0 '), printLink.closest('p') || printLink, document.createTextNode(' \u00a0\u00a0 '));
    printLink.setAttribute('role', 'button');
    printLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
    utilities.append(print);
  }

  if (rateLabel) {
    const rate = el('span', 'rate');
    rate.append(rateLabel);
    utilities.append(rate, document.createTextNode(' '));
  }

  if (rateLink) {
    const stars = buildRateStars(rateLink.href);
    // the authored link rides inside the star group as its accessible name (visually hidden)
    const name = el('span', 'stars-name');
    name.append(rateLink.closest('p') || rateLink);
    stars.append(name);
    utilities.append(stars);
  }

  block.replaceChildren(utilities);
}
