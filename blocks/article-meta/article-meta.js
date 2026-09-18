/**
 * article-meta — the KB article's details row: a label/value table (Date, Categories …)
 * in the left column and the average-rating stars in the right column. Live: legacy
 * `.knowledgebasearticle > .row` (Bootstrap 3, `table.details` col-xs-8/col-sm-10 +
 * `.avgrating` col-xs-4/col-sm-2). Prototype: stardust/prototypes/kb-article-proposed.html
 * `.kb-meta`; schema: stardust/eds-schema/kb-article.json § article-meta.
 * Decode tier: reconstructive (rows are authorable — any number of label/value rows, any
 * number of category links, optional rating row).
 *
 * Authoring rows — 2 cells each, `label | value` (labels are DISPLAYED copy, authored verbatim
 * with their colon, exactly as the live table shows them — D14 trade recorded in
 * stardust/eds-conversion-log-kb.md § 1):
 *   Date:        | 03/02/2026
 *   Categories:  | <a href="/support/knowledge-base-articles?filter=…">SelexION technology</a>,
 *                  <a href="…">Analyst software</a>
 *   Rating:      | 0 (0 votes)
 *     ← the row whose label starts with "Rating" is the snapshot average, "<value> (<count>
 *       votes)"; rendered as 5 star glyphs (full / half / outline), the authored text stays in
 *       the DOM as the accessible name (sr-only wrapper).
 *
 * decorate() MOVES every authored <p> (EW1/EW3): label/value paragraphs into <td>s, the rating
 * label + value into `.rating-text`. No text is generated — the stars are empty <i> glyphs.
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

// read-only classification helper — decisions only, never displayed text (EW1)
const text = (node) => (node ? node.textContent.trim() : '');

function parseRating(value) {
  const m = value.match(/(\d+(?:[.,]\d+)?)/);
  const rating = m ? Math.min(5, Math.max(0, parseFloat(m[1].replace(',', '.')))) : 0;
  const c = value.match(/(\d+)\s*(?:votes?|ratings?)/i);
  return { rating, count: c ? parseInt(c[1], 10) : 0 };
}

function buildStars(rating) {
  const stars = el('div', 'stars');
  stars.setAttribute('aria-hidden', 'true');
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  for (let i = 0; i < 5; i += 1) {
    const star = el('i', 'fa');
    if (i < full) star.classList.add('full');
    else if (i === full && half) star.classList.add('half');
    stars.append(star);
  }
  return stars;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const details = el('div', 'details');
  const table = el('table');
  const tbody = el('tbody');
  table.append(tbody);
  details.append(table);
  const ratingCol = el('div', 'rating');

  rows.forEach((row) => {
    const [labelCell, valueCell] = [...row.children];
    if (!labelCell) return;
    const label = text(labelCell);
    const value = text(valueCell);
    const isRating = /^rating\b/i.test(label)
      || (!!valueCell && !valueCell.querySelector('a') && /^\d/.test(value) && /vote|rating|\/\s*5/i.test(value));

    if (isRating) {
      const { rating, count } = parseRating(value);
      ratingCol.dataset.rating = String(rating);
      ratingCol.dataset.entityvotecount = String(count);
      const stars = buildStars(rating);
      const srText = el('div', 'rating-text');
      // MOVE the authored label + value paragraphs (accessible name, still editable)
      srText.append(...labelCell.childNodes);
      if (valueCell) srText.append(...valueCell.childNodes);
      ratingCol.append(stars, srText);
      return;
    }

    const tr = el('tr');
    const th = el('td', 'label');
    th.append(...labelCell.childNodes);
    const td = el('td');
    if (valueCell) td.append(...valueCell.childNodes);
    tr.append(th, td);
    tbody.append(tr);
  });

  block.replaceChildren(details, ratingCol);
}
