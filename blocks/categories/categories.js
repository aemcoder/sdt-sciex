/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/categories/categories.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
import { decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/sx/scripts.js';

export default function decorate(block) {
  const categoriesContainer = document.createElement('div');
  categoriesContainer.className = 'categories-container-text';
  moveInstrumentation(block, categoriesContainer);

  const rows = [...block.children];

  // Meta Configuration
  const id = rows[0]?.textContent.trim() || '';
  const arrowIconHTML = rows[1]?.innerHTML?.trim() || '';
  const columns = parseInt(rows[2]?.textContent.trim(), 10) || 3;

  if (id) categoriesContainer.id = `${id}-content`;

  // Create grid
  const grid = document.createElement('div');
  grid.className = `categories-grid columns-${columns}`;
  categoriesContainer.append(grid);

  // Parse cards starting from row index 3
  rows.slice(3).forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    const iconHTML = cells[0]?.innerHTML.trim();
    const headingHTML = cells[1]?.innerHTML.trim();
    const descriptionHTML = cells[2]?.innerHTML.trim();
    const linkHref = cells[3]?.textContent.trim() || '#';
    const targetUrl = cells[4]?.textContent.trim() || '_blank';

    const card = document.createElement('a');
    card.className = 'category-card';
    card.href = linkHref;
    card.target = targetUrl;

    // ICON
    if (iconHTML) {
      const iconBox = document.createElement('div');
      iconBox.className = 'category-icon';
      iconBox.innerHTML = iconHTML;
      card.append(iconBox);
    }

    // CONTENT WRAPPER
    const content = document.createElement('div');
    content.className = 'category-content';

    if (headingHTML) {
      const heading = document.createElement('div');
      heading.className = 'category-title';
      heading.innerHTML = headingHTML;
      content.append(heading);
    }

    if (descriptionHTML) {
      const p = document.createElement('p');
      p.className = 'category-description';
      p.innerHTML = descriptionHTML;
      content.append(p);
    }

    card.append(content);

    if (arrowIconHTML) {
      const arrow = document.createElement('div');
      arrow.className = iconHTML ? 'category-arrow-top' : 'category-arrow-bottom';
      arrow.innerHTML = arrowIconHTML;
      card.append(arrow);
    }
    moveInstrumentation(row, card);
    grid.append(card);
  });

  decorateIcons(categoriesContainer, '/blocks/categories');
  block.innerHTML = '';
  block.append(categoriesContainer);
}
